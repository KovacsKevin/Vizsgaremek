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
    if (activeJobs.has(eventId)) {
      activeJobs.delete(eventId);
    }
    
  } catch (error) {
    console.error(`Hiba az esemény (ID: ${eventId}) végleges törlésekor:`, error);
  }
};

// Időzítés beállítása egy eseményhez (záróidő + 31 nap után törlés)
const scheduleEventDeletion = (event) => {
  try {
    // Ha már van időzítés ehhez az eseményhez, töröljük
    if (activeJobs.has(event.id)) {
      activeJobs.get(event.id).cancel();
      activeJobs.delete(event.id);
    }
    
    const endTime = new Date(event.zaroIdo);
    
    // Kiszámoljuk a törlési időpontot (záróidő + 31 nap)
    const deletionTime = new Date(endTime);
    deletionTime.setDate(deletionTime.getDate() + 31);
    
    // Ellenőrizzük, hogy a törlési időpont a jövőben van-e
    if (deletionTime <= new Date()) {
      // Ha már lejárt a 31 napos időszak is, azonnal töröljük
      console.log(`Az esemény (ID: ${event.id}) archiválási időszaka már lejárt, azonnali törlés...`);
      deleteEvent(event.id);
      return;
    }
    
    // Időzítés beállítása a törlési időpontra (záróidő + 31 nap)
    const job = schedule.scheduleJob(deletionTime, () => {
      deleteEvent(event.id);
    });
    
    // Időzítés mentése
    activeJobs.set(event.id, job);
    
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
    
  } catch (error) {
    console.error('Hiba az események időzítésekor:', error);
  }
};

module.exports = {
  scheduleEventDeletion,
  scheduleAllEvents
};
