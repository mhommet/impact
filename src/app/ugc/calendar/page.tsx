'use client';

import {
  faArrowLeft,
  faCalendarAlt,
  faCalendarPlus,
  faTimes,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import { useAuth } from '@/hooks/useAuth';

import Navbar from '../../components/navbar';
import TopBar from '../../components/topBar';
import '../../globals.css';

interface Event {
  _id: string;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  description?: string;
  offerName?: string;
  userId?: string;
}

// Formater la date pour l'affichage dans le calendrier
const formatDateToFrench = (dateObj: Date) => {
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  return `${day}/${month}/${year}`;
};

// Ajuster le format de date d'entrée dans le formulaire
const toInputDateFormat = (dateObj: Date) => {
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  return `${year}-${month}-${day}`;
};

export default function Calendar() {
  const { userId, isLoading: authLoading } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentView, setCurrentView] = useState('month'); // 'month', 'week', 'day'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: toInputDateFormat(new Date()),
    displayDate: formatDateToFrench(new Date()),
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    offerName: '',
  });
  const [offers, setOffers] = useState<{ _id: string; name: string }[]>([]);
  const [addingEvent, setAddingEvent] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState<string | null>(null);
  const [showEventDetails, setShowEventDetails] = useState<Event | null>(null);

  useEffect(() => {
    if (userId && !authLoading) {
      fetchEvents();
      fetchOffers();
    }
  }, [userId, authLoading]);

  // Convertir les dates du format API (YYYY-MM-DD) vers le format d'affichage (DD/MM/YYYY) pour les événements
  const convertEventDates = (eventsArray: Event[]): Event[] => {
    return eventsArray.map((event) => {
      // La date est stockée au format API (YYYY-MM-DD) mais affichée au format DD/MM/YYYY
      return event;
    });
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/calendar/events');

      if (!response.ok) {
        console.warn("L'API des événements n'est pas disponible:", response.status);
        setEvents([]);
        return;
      }

      const data = await response.json();
      setEvents(data);
    } catch (err) {
      console.error('Erreur lors du chargement des événements:', err);
      setError('Erreur lors du chargement des événements');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOffers = async () => {
    try {
      const response = await fetch('/api/ugc/offers');

      if (!response.ok) {
        console.warn("L'API des offres n'est pas disponible:", response.status);
        setOffers([]);
        return;
      }

      const data = await response.json();
      setOffers(data);
    } catch (err) {
      console.error('Erreur lors du chargement des offres:', err);
      setOffers([]);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Si c'est le champ date
    if (name === 'date') {
      // Si le format est JJ/MM/AAAA (format français)
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
        const [day, month, year] = value.split('/').map(Number);
        // Créer un objet Date et vérifier sa validité
        const dateObj = new Date(year, month - 1, day);

        if (!isNaN(dateObj.getTime())) {
          // Si la date est valide, mettre à jour avec les deux formats
          const formattedDate = toInputDateFormat(dateObj);
          setNewEvent({
            ...newEvent,
            date: formattedDate,
            displayDate: value,
          });
        } else {
          // Si la date est invalide, mettre à jour uniquement la valeur affichée
          setNewEvent({
            ...newEvent,
            displayDate: value,
          });
        }
      } else {
        // Si ce n'est pas au format JJ/MM/AAAA, simplement mettre à jour la valeur affichée
        setNewEvent({
          ...newEvent,
          displayDate: value,
        });
      }
    } else {
      // Pour les autres champs, comportement normal
      setNewEvent({ ...newEvent, [name]: value });
    }
  };

  // Fonction pour gérer les changements de date spécifiquement
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isoDate = e.target.value; // format YYYY-MM-DD
    if (isoDate) {
      const dateObj = new Date(isoDate);
      setNewEvent({
        ...newEvent,
        date: isoDate,
        displayDate: formatDateToFrench(dateObj),
      });
    }
  };

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.date) {
      setError('Veuillez remplir les champs obligatoires');
      return;
    }

    setAddingEvent(true);

    try {
      const eventData = {
        ...newEvent,
        userId,
      };

      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout de l'événement");
      }

      const savedEvent = await response.json();

      // Ajouter l'événement à la liste locale
      setEvents([...events, savedEvent]);
      setShowAddEvent(false);
      setNewEvent({
        title: '',
        date: toInputDateFormat(new Date()),
        displayDate: formatDateToFrench(new Date()),
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        offerName: '',
      });
      setError('');
    } catch (err) {
      console.error('Erreur:', err);
      setError("Erreur lors de l'ajout de l'événement");
    } finally {
      setAddingEvent(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      setDeletingEvent(eventId);

      const response = await fetch(`/api/calendar/events/${eventId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de l'événement");
      }

      // Supprimer l'événement de la liste locale
      setEvents(events.filter((event) => event._id !== eventId));
      setShowEventDetails(null);
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setError("Erreur lors de la suppression de l'événement");
    } finally {
      setDeletingEvent(null);
    }
  };

  // Fonction pour grouper les événements par jour dans le calendrier
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Premier jour du mois
    const firstDay = new Date(year, month, 1);
    // Dernier jour du mois
    const lastDay = new Date(year, month + 1, 0);

    // Jours à afficher dans le calendrier (y compris les jours du mois précédent/suivant pour compléter les semaines)
    const days = [];

    // Ajouter les jours du mois précédent pour compléter la première semaine
    const firstDayOfWeek = firstDay.getDay(); // 0 = dimanche, 1 = lundi, etc.
    const prevMonthDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Ajustement pour commencer par lundi

    for (let i = prevMonthDays - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({
        date,
        isCurrentMonth: false,
        events: events.filter(
          (event) => new Date(event.date).toDateString() === date.toDateString()
        ),
      });
    }

    // Ajouter les jours du mois actuel
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: true,
        events: events.filter(
          (event) => new Date(event.date).toDateString() === date.toDateString()
        ),
      });
    }

    // Ajouter les jours du mois suivant pour compléter la dernière semaine
    const lastDayOfWeek = lastDay.getDay();
    const nextMonthDays = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek;

    for (let i = 1; i <= nextMonthDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        events: events.filter(
          (event) => new Date(event.date).toDateString() === date.toDateString()
        ),
      });
    }

    return days;
  };

  // Format date dans le titre du mois
  const getCurrentMonthName = () => {
    const month = currentDate.toLocaleDateString('fr-FR', { month: 'long' });
    const year = currentDate.getFullYear();
    return `${month} ${year}`;
  };

  // Fonctions de navigation dans le calendrier
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const calendarDays = generateCalendarDays();

  if (loading) {
    return <div className="text-center mt-8">Chargement...</div>;
  }

  return (
    <div>
      <TopBar />
      <div className="relative isolate px-4 pt-5 lg:px-8 mb-40">
        <div className="flex items-center mb-6">
          <Link href="/ugc/dashboard" className="mr-4">
            <button className="bg-gray-200 rounded-full p-2">
              <FontAwesomeIcon icon={faArrowLeft} className="text-gray-600" />
            </button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Mon calendrier</h1>
        </div>

        {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">{error}</div>}

        {/* Contrôles du calendrier */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            <button
              onClick={goToPreviousMonth}
              className="px-3 py-1 bg-gray-200 rounded text-gray-700 hover:bg-gray-300"
            >
              &lt;
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Aujourd&apos;hui
            </button>
            <button
              onClick={goToNextMonth}
              className="px-3 py-1 bg-gray-200 rounded text-gray-700 hover:bg-gray-300"
            >
              &gt;
            </button>
          </div>
          <h2 className="text-xl font-semibold text-purple-600 capitalize">
            {getCurrentMonthName()}
          </h2>
          <button
            onClick={() => setShowAddEvent(true)}
            className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center"
          >
            <FontAwesomeIcon icon={faCalendarPlus} className="mr-2" />
            Ajouter
          </button>
        </div>

        {/* Calendrier vue mois */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Jours de la semaine */}
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
              <div key={day} className="p-2 text-center font-semibold bg-gray-100">
                {day}
              </div>
            ))}
          </div>
          {/* Jours du mois */}
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`min-h-[100px] p-1 ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'}`}
              >
                <div className="text-right p-1">{day.date.getDate()}</div>
                <div className="overflow-y-auto max-h-[80px]">
                  {day.events.map((event) => (
                    <div
                      key={event._id}
                      className="text-xs p-1 mb-1 rounded bg-purple-100 text-purple-800 truncate cursor-pointer hover:bg-purple-200"
                      title={`${event.title}${event.startTime ? ` (${event.startTime}-${event.endTime})` : ''}: ${event.description || ''}`}
                      onClick={() => setShowEventDetails(event)}
                    >
                      {event.startTime && <span className="font-bold">{event.startTime}</span>}{' '}
                      {event.title}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal d'ajout d'événement */}
        {showAddEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Ajouter un événement</h3>
                <button
                  onClick={() => setShowAddEvent(false)}
                  className="text-gray-500 hover:text-gray-800"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                  <input
                    type="text"
                    name="title"
                    value={newEvent.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="date"
                      placeholder="JJ/MM/AAAA"
                      value={newEvent.displayDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md pr-10"
                      required
                    />
                    <input
                      type="date"
                      className="sr-only"
                      value={newEvent.date}
                      onChange={handleDateChange}
                      id="hidden-date-picker"
                    />
                    <label
                      htmlFor="hidden-date-picker"
                      className="absolute right-3 top-2 cursor-pointer text-gray-500"
                    >
                      <FontAwesomeIcon icon={faCalendarAlt} />
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Heure de début
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={newEvent.startTime}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      step="60"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Heure de fin
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={newEvent.endTime}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      step="60"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={newEvent.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Offre associée
                  </label>
                  <select
                    name="offerName"
                    value={newEvent.offerName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Aucune</option>
                    {offers.map((offer) => (
                      <option key={offer._id} value={offer.name}>
                        {offer.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="pt-2">
                  <button
                    onClick={handleAddEvent}
                    disabled={addingEvent}
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50"
                  >
                    {addingEvent ? 'Ajout en cours...' : "Ajouter l'événement"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de détails d'événement */}
        {showEventDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{showEventDetails.title}</h3>
                <button
                  onClick={() => setShowEventDetails(null)}
                  className="text-gray-500 hover:text-gray-800"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Date:</p>
                  <p className="font-medium">
                    {formatDateToFrench(new Date(showEventDetails.date))}
                  </p>
                </div>
                {(showEventDetails.startTime || showEventDetails.endTime) && (
                  <div>
                    <p className="text-sm text-gray-500">Horaire:</p>
                    <p className="font-medium">
                      {showEventDetails.startTime && showEventDetails.endTime
                        ? `${showEventDetails.startTime} - ${showEventDetails.endTime}`
                        : showEventDetails.startTime || showEventDetails.endTime}
                    </p>
                  </div>
                )}
                {showEventDetails.description && (
                  <div>
                    <p className="text-sm text-gray-500">Description:</p>
                    <p className="text-gray-700">{showEventDetails.description}</p>
                  </div>
                )}
                {showEventDetails.offerName && (
                  <div>
                    <p className="text-sm text-gray-500">Offre associée:</p>
                    <p className="text-purple-600 font-medium">{showEventDetails.offerName}</p>
                  </div>
                )}
                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => handleDeleteEvent(showEventDetails._id)}
                    disabled={!!deletingEvent}
                    className="flex items-center text-red-600 hover:text-red-800"
                  >
                    <FontAwesomeIcon icon={faTrash} className="mr-1" />
                    {deletingEvent === showEventDetails._id ? 'Suppression...' : 'Supprimer'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Navbar />
    </div>
  );
}
