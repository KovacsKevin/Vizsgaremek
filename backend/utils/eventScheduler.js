const schedule = require('node-schedule');
const Esemény = require('../models/esemenyModel');
const Résztvevő = require('../models/resztvevoModel');
const sequelize = require('../config/db');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Aktív időzítések tárolása
const activeJobs = new Map();

// Esemény törlése és a résztvevők eltávolítása
const deleteEvent = async (eventId) => {
  try {
    console.log(`Esemény törlése (ID: ${eventId}) a záróidő lejárta miatt...`);
    
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
      
      console.log(`Esemény (ID: ${eventId}) sikeresen törölve. ${deletedParticipants} résztvevő eltávolítva.`);
    });
    
    // Töröljük az időzítést a Map-ből
    if (activeJobs.has(eventId)) {
      activeJobs.delete(eventId);
    }
    
  } catch (error) {
    console.error(`Hiba az esemény (ID: ${eventId}) törlésekor:`, error);
  }
};

// Időzítés beállítása egy eseményhez
const scheduleEventDeletion = (event) => {
  try {
    // Ha már van időzítés ehhez az eseményhez, töröljük
    if (activeJobs.has(event.id)) {
      activeJobs.get(event.id).cancel();
      activeJobs.delete(event.id);
    }
    
    const endTime = new Date(event.zaroIdo);
    
    // Ellenőrizzük, hogy a záróidő a jövőben van-e
    if (endTime <= new Date()) {
      // Ha már lejárt, azonnal töröljük
      console.log(`Az esemény (ID: ${event.id}) záróideje már lejárt, azonnali törlés...`);
      deleteEvent(event.id);
      return;
    }
    
    // Időzítés beállítása a záróidőre
    const job = schedule.scheduleJob(endTime, () => {
      deleteEvent(event.id);
    });
    
    // Időzítés mentése
    activeJobs.set(event.id, job);
    
    console.log(`Esemény törlés időzítve (ID: ${event.id}) - Záróidő: ${endTime.toLocaleString()}`);
    
  } catch (error) {
    console.error(`Hiba az esemény (ID: ${event.id}) időzítésekor:`, error);
  }
};

// Összes aktív esemény időzítésének beállítása
const scheduleAllEvents = async () => {
  try {
    console.log('Összes aktív esemény időzítésének beállítása...');
    
    // Lekérjük az összes jövőbeli eseményt
    const events = await Esemény.findAll({
      where: {
        zaroIdo: { [Op.gt]: new Date() } // Csak a jövőbeli záróidejű események
      }
    });
    
    console.log(`${events.length} aktív esemény található.`);
    
    // Időzítés beállítása minden eseményhez
    events.forEach(event => {
      scheduleEventDeletion(event);
    });
    
    // Lejárt események azonnali törlése
    const expiredEvents = await Esemény.findAll({
      where: {
        zaroIdo: { [Op.lte]: new Date() } // Már lejárt záróidejű események
      }
    });
    
    console.log(`${expiredEvents.length} lejárt esemény azonnali törlése...`);
    
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
