const schedule = require('node-schedule');
const Esemény = require('../models/esemenyModel');
const Résztvevő = require('../models/resztvevoModel');
const sequelize = require('../config/db');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

const activeJobs = new Map();

const deleteEvent = async (eventId) => {
  try {
    console.log(`Esemény végleges törlése (ID: ${eventId}) a 31 napos archiválási időszak lejárta után...`);

    await sequelize.transaction(async (t) => {
      const event = await Esemény.findByPk(eventId, { transaction: t });
      
      if (!event) {
        console.log(`Az esemény (ID: ${eventId}) már nem létezik.`);
        return;
      }

      if (event.imageUrl) {
        const imagePath = path.join(__dirname, '..', event.imageUrl);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log(`Esemény képe törölve: ${imagePath}`);
        }
      }

      const deletedParticipants = await Résztvevő.destroy({
        where: { eseményId: eventId },
        transaction: t
      });

      await event.destroy({ transaction: t });
      
      console.log(`Esemény (ID: ${eventId}) véglegesen törölve. ${deletedParticipants} résztvevő eltávolítva.`);
    });

    if (activeJobs.has(`delete_${eventId}`)) {
      activeJobs.delete(`delete_${eventId}`);
    }
    
  } catch (error) {
    console.error(`Hiba az esemény (ID: ${eventId}) végleges törlésekor:`, error);
  }
};

const cleanupPendingRequests = async (eventId) => {
  try {
    console.log(`Függőben lévő csatlakozási kérelmek törlése (Esemény ID: ${eventId})...`);

    await sequelize.transaction(async (t) => {
      const event = await Esemény.findByPk(eventId, { transaction: t });
      
      if (!event) {
        console.log(`Az esemény (ID: ${eventId}) nem létezik.`);
        return;
      }

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

    if (activeJobs.has(`cleanup_${eventId}`)) {
      activeJobs.delete(`cleanup_${eventId}`);
    }
    
  } catch (error) {
    console.error(`Hiba a függőben lévő kérelmek törlésekor (Esemény ID: ${eventId}):`, error);
  }
};

const scheduleEventDeletion = (event) => {
  try {
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

    const deletionTime = new Date(endTime);
    deletionTime.setDate(deletionTime.getDate() + 31);

    if (endTime > now) {
      const cleanupJob = schedule.scheduleJob(endTime, () => {
        cleanupPendingRequests(event.id);
      });

      activeJobs.set(`cleanup_${event.id}`, cleanupJob);
      
      console.log(`Függőben lévő kérelmek törlése időzítve (ID: ${event.id}) - Záróidő: ${endTime.toLocaleString()}`);
    } else {
      cleanupPendingRequests(event.id);
    }
    
    if (deletionTime <= now) {
      console.log(`Az esemény (ID: ${event.id}) archiválási időszaka már lejárt, azonnali törlés...`);
      deleteEvent(event.id);
      return;
    }

    const deleteJob = schedule.scheduleJob(deletionTime, () => {
      deleteEvent(event.id);
    });

    activeJobs.set(`delete_${event.id}`, deleteJob);
    
    console.log(`Esemény végleges törlés időzítve (ID: ${event.id}) - Archiválási időszak vége: ${deletionTime.toLocaleString()}`);
    
  } catch (error) {
    console.error(`Hiba az esemény (ID: ${event.id}) időzítésekor:`, error);
  }
};

const scheduleAllEvents = async () => {
  try {
    console.log('Összes esemény időzítésének beállítása...');
    
    const thirtyOneDaysAgo = new Date();
    thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31);
    
    const events = await Esemény.findAll({
      where: {
        zaroIdo: { [Op.gt]: thirtyOneDaysAgo } 
      }
    });
    
    console.log(`${events.length} esemény található az időzítéshez.`);

    events.forEach(event => {
      scheduleEventDeletion(event);
    });

    const expiredEvents = await Esemény.findAll({
      where: {
        zaroIdo: { [Op.lte]: thirtyOneDaysAgo } 
      }
    });
    
    console.log(`${expiredEvents.length} 31 napnál régebbi esemény azonnali törlése...`);
    
    for (const event of expiredEvents) {
      await deleteEvent(event.id);
    }

    const currentTime = new Date();
    const archivedEvents = await Esemény.findAll({
      where: {
        zaroIdo: { 
          [Op.lte]: currentTime,  
          [Op.gt]: thirtyOneDaysAgo  
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
