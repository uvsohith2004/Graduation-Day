// constants/home-data.ts

const date = new Date();
const year = date.getFullYear();

const homeData = {
  // Registration
  lastDate: '2026-07-02',
  lastTime: '23:59',

  // College
  id: 'college-name',
  collegeName: 'PBR Visvodaya Institute of Technology and Science',

  // Event
  event: 'Graduation Day',
  eventYear: year,
  eventMonth: 'July',
  eventDate: '4th-5th',
  suffix: '',

  // Hero
  heroBadge: 'PBR VITS Autonomous',
  heroTitle: 'Graduation Day',
  heroHighlight: `${year}.`,
  heroDescription:
    'A national level celebration of excellence. Join us in honoring the achievements, resilience, and future legacy of the Class of 2026.',

  // Buttons
  registerButton: 'Register Now',
  scheduleButton: 'View Schedule',

  // Venue
  venueName: 'KVR Convention',
  venueLocation: 'Jammalapalem, Kavali, SPSR Nellore District',
  eventAddress:
    'KVR Convention, Jammalapalem, Kavali, SPSR Nellore District',

  // Downloads
  downloadSize: 'Poster',

  // Images
  heroImages: {
    main:
      'https://static.vecteezy.com/system/resources/thumbnails/028/246/511/small/graduation-caps-thrown-in-the-air-generative-ai-photo.jpg',
    graduationScroll:
      'https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?q=80&w=2070&auto=format&fit=crop',
    campus:
      'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop',
  },
};

export default homeData;
