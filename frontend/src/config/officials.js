export const OFFICIAL_ROSTER = {
  "pooja.verma@nhm.gov.in": {
    actorId: "USER_REC_019",
    id: "USER_REC_019",
    name: "Pooja Verma",
    role: "clerk",
    roleTitle: "Health Records Officer",
    facilityId: "PHC-019",
    facilityName: "Primary Health Centre (PHC-019)",
    canSwitchFacility: false,
    defaultTab: "dashboard"
  },
  "sunita.sharma@nhm.gov.in": {
    actorId: "USER_REC_042",
    id: "USER_REC_042",
    name: "Sunita Sharma",
    role: "clerk",
    roleTitle: "Health Records Officer",
    facilityId: "PHC-042",
    facilityName: "Primary Health Centre (PHC-042)",
    canSwitchFacility: false,
    defaultTab: "dashboard"
  },
  "dr.rajesh@nhm.gov.in": {
    actorId: "DOC_KUMAR_042",
    id: "DOC_KUMAR_042",
    name: "Dr. Rajesh Kumar",
    role: "doctor",
    roleTitle: "Medical Officer In-Charge",
    facilityId: "PHC-042",
    facilityName: "Primary Health Centre (PHC-042)",
    canSwitchFacility: false,
    defaultTab: "clinic-desk"
  },
  "auditor.state@nhm.gov.in": {
    actorId: "AUDIT_DIR_STATE",
    id: "AUDIT_DIR_STATE",
    name: "Dr. V. Ramanathan",
    role: "auditor",
    roleTitle: "State Epidemiologist & Forensic Auditor",
    facilityId: "PHC-042",
    facilityName: "Statewide Jurisdiction",
    canSwitchFacility: true,
    defaultTab: "spatial-war-room"
  }
};

export const getOfficialByEmail = (email) => {
  if (!email) return OFFICIAL_ROSTER["sunita.sharma@nhm.gov.in"];
  const normalized = email.toLowerCase().trim();
  if (OFFICIAL_ROSTER[normalized]) {
    return OFFICIAL_ROSTER[normalized];
  }
  // Fallback for unlisted official emails
  return {
    actorId: "USER_REC_042",
    id: "USER_REC_042",
    name: email.split('@')[0].replace('.', ' ').toUpperCase(),
    role: "clerk",
    roleTitle: "Authenticated Official",
    facilityId: "PHC-042",
    facilityName: "Primary Health Centre (PHC-042)",
    canSwitchFacility: false,
    defaultTab: "dashboard"
  };
};
