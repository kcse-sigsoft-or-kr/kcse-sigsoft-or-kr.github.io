const legacyHashRoutes = {
  overview: "/2027/index.html",
  welcome: "/2027/introduction/welcome.html",
  location: "/2027/introduction/location.html",
  attractions: "/2027/introduction/attractions.html",
  registration: "/2027/attendance/registration.html",
  dates: "/2027/attendance/dates.html",
  "call-for-papers": "/2027/papers/call-for-papers.html",
  "paper-submission": "/2027/papers/paper-submission.html",
  proposals: "/2027/papers/proposals.html",
  "invited-papers": "/2027/papers/invited-papers.html",
  awards: "/2027/papers/awards.html",
  keynote: "/2027/program/keynote.html",
  tutorials: "/2027/program/tutorials.html",
  "young-researchers": "/2027/program/young-researchers.html",
  "special-events": "/2027/program/special-events.html",
  "organizing-committee": "/2027/committee/organizing-committee.html",
  "program-committee": "/2027/committee/program-committee.html",
};

const legacyRoute = legacyHashRoutes[window.location.hash.slice(1)];

if (legacyRoute) {
  const targetUrl = new URL(legacyRoute, window.location.origin);
  targetUrl.hash = "";

  if (targetUrl.pathname !== window.location.pathname) {
    window.location.replace(targetUrl.href);
  }
}
