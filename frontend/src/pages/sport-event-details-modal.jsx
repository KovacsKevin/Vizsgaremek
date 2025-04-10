"use client"

import { useState, useEffect } from "react"
import {
  X, MapPin, Calendar, Clock, Users, Home, DoorOpen, Car, User, CheckCircle, XCircle, Trash, Edit, Plus, Archive,
  Mail, Phone, AlertTriangle, Map, ShowerHead
} from "lucide-react"
import EventModal from "./Main/EventModal"
import LocationMapModal from "./Main/LocationMapModal"
import UserProfileModal from "./Main/UserProfileModal"


// Exportáljuk az Image komponenst és a segédfüggvényeket, hogy más fájlok is használhassák
export const Image = ({ src, alt, className }) => {
  const [error, setError] = useState(false);

  const formatImageUrl = (url) => {
    if (!url || error) return "https://media.istockphoto.com/id/526947869/vector/man-silhouette-profile-picture.jpg?s=612x612&w=0&k=20&c=5I7Vgx_U6UPJe9U2sA2_8JFF4grkP7bNmDnsLXTYlSc=";

    if (url.startsWith('http://localhost:8081')) return url;

    if (url.startsWith('data:image/')) return url;

    return `http://localhost:8081${url.startsWith('/') ? url : `/${url}`}`;
  };

  return (
    <img
      src={formatImageUrl(src)}
      alt={alt || ''}
      className={className || ''}
      onError={(e) => {
        console.error(`Kép betöltési hiba: ${src && src.substring(0, 100)}...`);
        setError(true);
      }}
    />
  );
};

export const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

export const getCurrentUser = () => {
  try {
    const token = getCookie('token');
    if (!token) return null;

    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error parsing user token:", error);
    return null;
  }
};

const SportEventDetailsModal = ({
  event,
  onClose,
  onParticipantUpdate,
  isArchived = false,
  isInvitation = false,
  isPending = false,
  onAcceptInvitation,
  onRejectInvitation,
  onCancelPendingRequest
}) => {
  return (
    <EventModal
      event={event}
      onClose={onClose}
      onParticipantUpdate={onParticipantUpdate}
      isArchived={isArchived}
      isInvitation={isInvitation}
      onAcceptInvitation={onAcceptInvitation}
      onRejectInvitation={onRejectInvitation}
      onCancelPendingRequest={onCancelPendingRequest}
    />
  );
};
export default SportEventDetailsModal;
