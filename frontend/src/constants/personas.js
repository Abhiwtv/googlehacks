export const DEMO_PERSONAS = {
  clerk_019: {
    id: "USER_REC_019",
    name: "Pooja Verma",
    role: "clerk",
    roleTitle: "Health Records Officer",
    facilityId: "PHC-019",
    facilityName: "Primary Health Centre (PHC-019)",
    canSwitchFacility: false,
    defaultTab: "dashboard"
  },
  clerk_042: {
    id: "USER_REC_042",
    name: "Sunita Sharma",
    role: "clerk",
    roleTitle: "Health Records Officer",
    facilityId: "PHC-042",
    facilityName: "Primary Health Centre (PHC-042)",
    canSwitchFacility: false,
    defaultTab: "dashboard"
  },
  doctor_042: {
    id: "DOC_KUMAR_042",
    name: "Dr. Rajesh Kumar",
    role: "doctor",
    roleTitle: "Medical Officer In-Charge",
    facilityId: "PHC-042",
    facilityName: "Primary Health Centre (PHC-042)",
    canSwitchFacility: false,
    defaultTab: "clinic-desk"
  },
  auditor_state: {
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

export const ROLE_ALLOWED_TABS = {
  clerk: ['dashboard', 'ingestion', 'hitl'],
  doctor: ['dashboard', 'clinic-desk', 'facility-ops', 'forecast'],
  auditor: ['dashboard', 'forecast', 'spatial-war-room', 'audit']
};
