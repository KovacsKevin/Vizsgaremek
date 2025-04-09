const schedule = require('node-schedule');
const Esemény = require('../models/esemenyModel');
const Résztvevő = require('../models/resztvevoModel');
const sequelize = require('../config/db');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Aktív időzítések tárolása
const activeJobs = new Map();

// Esemény végleges törlése és a résztvevők eltávolítása (31 nap után)
const deleteEvent = async (eventId) => {
  try {
    console.log(`Esemény végleges törlése (ID: ${eventId}) a 31 napos archiválási időszak lejárta után...`);
    
    // Tranzakció kezdése
    await sequelize.transaction(async (t) => {
      // Esemény lekérése a kép URL-jéhez
      const event = await Esemény.findByPk(eventId, { transaction: t });
      
      if (!event) {
        console.log(`Az esemény (ID: ${eventId}) már nem létezik.`);
        return;
      }
      
      // Kép törlése, ha van
      if (event.imageUrl) {
        const imagePath = path.join(__dirname, '..', event.imageUrl);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log(`Esemény képe törölve: ${imagePath}`);
        }
      }
      
      // Résztvevők törlése
      const deletedParticipants = await Résztvevő.destroy({
        where: { eseményId: eventId },
        transaction: t
      });
      
      // Esemény törlése
      await event.destroy({ transaction: t });
      
      console.log(`Esemény (ID: ${eventId}) véglegesen törölve. ${deletedParticipants} résztvevő eltávolítva.`);
    });
    
    // Töröljük az időzítést a Map-ből
    if (activeJobs.has(`delete_${eventId}`)) {
      activeJobs.delete(`delete_${eventId}`);
    }
    
  } catch (error) {
    console.error(`Hiba az esemény (ID: ${eventId}) végleges törlésekor:`, error);
  }
};

// Függőben lévő csatlakozási kérelmek törlése esemény lejáratakor
const cleanupPendingRequests = async (eventId) => {
  try {
    console.log(`Függőben lévő csatlakozási kérelmek törlése (Esemény ID: ${eventId})...`);
    
    // Tranzakció kezdése
    await sequelize.transaction(async (t) => {
      // Ellenőrizzük, hogy az esemény létezik-e
      const event = await Esemény.findByPk(eventId, { transaction: t });
      
      if (!event) {
        console.log(`Az esemény (ID: ${eventId}) nem létezik.`);
        return;
      }
      
      // Függőben lévő és meghívott státuszú résztvevők törlése
      const deletedPending = await Résztvevő.destroy({
        where: { 
          eseményId: eventId,
          státusz: {
            [Op.in]: ['függőben', 'meghívott']
          }
        },
        transaction: t
      });
      
      console.log(`Esemény (ID: ${eventId}) - ${deletedPending} függőben lévő csatlakozási kérelem törölve.`);
    });
    
    // Töröljük az időzítést a Map-ből
    if (activeJobs.has(`cleanup_${eventId}`)) {
      activeJobs.delete(`cleanup_${eventId}`);
    }
    
  } catch (error) {
    console.error(`Hiba a függőben lévő kérelmek törlésekor (Esemény ID: ${eventId}):`, error);
  }
};

// Időzítés beállítása egy eseményhez (záróidő + 31 nap után törlés)
const scheduleEventDeletion = (event) => {
  try {
    // Ha már van időzítés ehhez az eseményhez, töröljük
    if (activeJobs.has(`delete_${event.id}`)) {
      activeJobs.get(`delete_${event.id}`).cancel();
      activeJobs.delete(`delete_${event.id}`);
    }
    
    if (activeJobs.has(`cleanup_${event.id}`)) {
      activeJobs.get(`cleanup_${event.id}`).cancel();
      activeJobs.delete(`cleanup_${event.id}`);
    }
    
    const endTime = new Date(event.zaroIdo);
    const now = new Date();
    
    // Kiszámoljuk a törlési időpontot (záróidő + 31 nap)
    const deletionTime = new Date(endTime);
    deletionTime.setDate(deletionTime.getDate() + 31);
    
    // Ellenőrizzük, hogy a záróidő a jövőben van-e
    if (endTime > now) {
      // Időzítés beállítása a záróidőre (függőben lévő kérelmek törlése)
      const cleanupJob = schedule.scheduleJob(endTime, () => {
        cleanupPendingRequests(event.id);
      });
      
      // Időzítés mentése
      activeJobs.set(`cleanup_${event.id}`, cleanupJob);
      
      console.log(`Függőben lévő kérelmek törlése időzítve (ID: ${event.id}) - Záróidő: ${endTime.toLocaleString()}`);
    } else {
      // Ha a záróidő már elmúlt, azonnal töröljük a függőben lévő kérelmeket
      cleanupPendingRequests(event.id);
    }
    
    // Ellenőrizzük, hogy a törlési időpont a jövőben van-e
    if (deletionTime <= now) {
      // Ha már lejárt a 31 napos időszak is, azonnal töröljük
      console.log(`Az esemény (ID: ${event.id}) archiválási időszaka már lejárt, azonnali törlés...`);
      deleteEvent(event.id);
      return;
    }
    
    // Időzítés beállítása a törlési időpontra (záróidő + 31 nap)
    const deleteJob = schedule.scheduleJob(deletionTime, () => {
      deleteEvent(event.id);
    });
    
    // Időzítés mentése
    activeJobs.set(`delete_${event.id}`, deleteJob);
    
    console.log(`Esemény végleges törlés időzítve (ID: ${event.id}) - Archiválási időszak vége: ${deletionTime.toLocaleString()}`);
    
  } catch (error) {
    console.error(`Hiba az esemény (ID: ${event.id}) időzítésekor:`, error);
  }
};

// Összes aktív esemény időzítésének beállítása
const scheduleAllEvents = async () => {
  try {
    console.log('Összes esemény időzítésének beállítása...');
    
    // Lekérjük az összes eseményt, aminek a záróideje még nem régebbi 31 napnál
    const thirtyOneDaysAgo = new Date();
    thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31);
    
    const events = await Esemény.findAll({
      where: {
        zaroIdo: { [Op.gt]: thirtyOneDaysAgo } // Csak azok az események, amik záróideje nem régebbi 31 napnál
      }
    });
    
    console.log(`${events.length} esemény található az időzítéshez.`);
    
    // Időzítés beállítása minden eseményhez
    events.forEach(event => {
      scheduleEventDeletion(event);
    });
    
    // 31 napnál régebbi események azonnali törlése
    const expiredEvents = await Esemény.findAll({
      where: {
        zaroIdo: { [Op.lte]: thirtyOneDaysAgo } // 31 napnál régebbi záróidejű események
      }
    });
    
    console.log(`${expiredEvents.length} 31 napnál régebbi esemény azonnali törlése...`);
    
    for (const event of expiredEvents) {
      await deleteEvent(event.id);
    }
    
    // Lejárt, de 31 napnál nem régebbi események függőben lévő kérelmeinek törlése
    const currentTime = new Date();
    const archivedEvents = await Esemény.findAll({
      where: {
        zaroIdo: { 
          [Op.lte]: currentTime,  // Záróidő már elmúlt
          [Op.gt]: thirtyOneDaysAgo  // De nem régebbi 31 napnál
        }
      }
    });
    
    console.log(`${archivedEvents.length} archivált esemény függőben lévő kérelmeinek törlése...`);
    
    for (const event of archivedEvents) {
      await cleanupPendingRequests(event.id);
    }
    
  } catch (error) {
    console.error('Hiba az események időzítésekor:', error);
  }
};

module.exports = {
  scheduleEventDeletion,
  scheduleAllEvents
};
