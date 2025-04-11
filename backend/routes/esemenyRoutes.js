const express = require("express");
const jwt = require("jsonwebtoken"); 
const esemenyController = require("../controllers/esemenyController"); 

const router = express.Router();

const authenticateToken = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1]; 
    if (!token) return res.sendStatus(401);

    jwt.verify(token, "secretkey", (err, user) => {
        if (err) return res.sendStatus(403); 
        req.user = user; 
        next(); 
    });
};

router.post("/createEsemeny", authenticateToken, esemenyController.createEsemeny);

router.get("/getEsemeny/:id", esemenyController.getEsemenyById);

router.put("/updateEsemeny/:id", authenticateToken, esemenyController.updateEsemeny);

router.delete("/deleteEsemeny/:id", authenticateToken, esemenyController.deleteEsemeny);

router.get("/getAllEsemeny", esemenyController.getAllEsemeny);
router.get('/getEsemenyek/:telepules/:sportNev', esemenyController.getEsemenyekByTelepulesAndSportNev);
router.post("/join",authenticateToken, esemenyController.joinEsemeny);
router.get('/getesemenyimin/:id',authenticateToken,  esemenyController.getEsemenyMinimal);

router.get("/events/:id/participants", esemenyController.getEventParticipants);

router.get("/events/:id/check-participation", authenticateToken, esemenyController.checkParticipation);
router.get('/getEsemenyekByAge/:telepules/:sportNev', authenticateToken, esemenyController.getEsemenyekFilteredByUserAge);

router.post("/leave", authenticateToken, esemenyController.leaveEsemeny);

router.get('/organized-events', authenticateToken, esemenyController.getOrganizedEvents);

router.get('/participated-events', authenticateToken, esemenyController.getParticipatedEvents);

router.get("/events-with-details", esemenyController.getAllEsemenyWithDetails);

router.post("/remove-participant", authenticateToken, esemenyController.removeParticipant);

router.get("/event-search-data/:id", esemenyController.getEventSearchData);

router.get('/all-events-by-age', authenticateToken, esemenyController.getAllEsemenyekFilteredByUserAge);

router.get('/getEsemenyekByTelepules/:telepules', esemenyController.getEsemenyekByTelepules);
router.get('/getEsemenyekBySportNev/:sportNev', esemenyController.getEsemenyekBySportNev);
router.get('/getEsemenyekByTelepulesAndAge/:telepules', authenticateToken, esemenyController.getEsemenyekByTelepulesAndAge);
router.get('/getEsemenyekBySportNevAndAge/:sportNev', authenticateToken, esemenyController.getEsemenyekBySportNevAndAge);

router.get("/events/:id/pending-participants", authenticateToken, esemenyController.getPendingParticipants);

router.post("/approve-participant", authenticateToken, esemenyController.approveParticipant);

router.post("/reject-participant", authenticateToken, esemenyController.rejectParticipant);

router.get('/archived-events', authenticateToken, esemenyController.getArchivedEvents);

router.post("/invite-user", authenticateToken, esemenyController.inviteUserToEvent);

router.post("/accept-invitation", authenticateToken, esemenyController.acceptInvitation);

router.post("/reject-invitation", authenticateToken, esemenyController.rejectInvitation);

router.post("/invite-users", authenticateToken, esemenyController.inviteUsersToEvent);

router.get("/invitations", authenticateToken, esemenyController.getUserInvitations);

router.get("/events/:id/all-invitations", authenticateToken, esemenyController.getAllEventInvitations);

router.get("/events/:id/search-users", authenticateToken, esemenyController.searchUsersForEvent);

router.get("/events/:id/search-users", authenticateToken, esemenyController.searchUsersForEvent);

router.get("/events/:id/all-invitations", authenticateToken, esemenyController.getAllEventInvitations);

router.get('/pending-events', authenticateToken, esemenyController.getPendingEvents);

router.post('/cancel-pending-request', authenticateToken, esemenyController.cancelPendingRequest);

router.get('/all-events-by-age-or-organizer', authenticateToken, esemenyController.getEsemenyekFilteredByUserAgeOrOrganizer);

router.get('/getEsemenyekByAgeOrOrganizer/:telepules/:sportNev', authenticateToken, esemenyController.getEsemenyekByTelepulesAndSportNevAndAgeOrOrganizer);

router.get('/getEsemenyekByTelepulesAndAgeOrOrganizer/:telepules', authenticateToken, esemenyController.getEsemenyekByTelepulesAndAgeOrOrganizer);

router.get('/getEsemenyekBySportNevAndAgeOrOrganizer/:sportNev', authenticateToken, esemenyController.getEsemenyekBySportNevAndAgeOrOrganizer);


module.exports = router;
