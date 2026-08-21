export const initialUsers = [
  {
    id: "usr_alex",
    name: "Alex Johnson",
    email: "alex.johnson@acmecorp.com",
    role: "employee",
    department: "Engineering",
    title: "Senior Full-Stack Engineer",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    phone: "+91 98765 43210",
    managerId: "usr_sarah"
  },
  {
    id: "usr_sarah",
    name: "Sarah Davis",
    email: "sarah.davis@acmecorp.com",
    role: "manager",
    department: "Engineering",
    title: "Engineering Lead / Manager",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    phone: "+91 98765 43211",
    managerId: "usr_michael"
  },
  {
    id: "usr_michael",
    name: "Michael Chang",
    email: "michael.chang@acmecorp.com",
    role: "department_head",
    department: "Engineering",
    title: "VP of Engineering & Technology",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    phone: "+91 98765 43212",
    managerId: "usr_david"
  },
  {
    id: "usr_priya",
    name: "Priya Sharma",
    email: "priya.sharma@acmecorp.com",
    role: "finance",
    department: "Finance",
    title: "Senior Finance Controller",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    phone: "+91 98765 43213",
    managerId: "usr_david"
  },
  {
    id: "usr_david",
    name: "David Miller",
    email: "david.miller@acmecorp.com",
    role: "admin",
    department: "Executive",
    title: "Chief Operating Officer / Admin",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    phone: "+91 98765 43214",
    managerId: null
  },
  {
    id: "usr_elena",
    name: "Elena Rostova",
    email: "elena.r@acmecorp.com",
    role: "employee",
    department: "Marketing",
    title: "Brand Strategy Specialist",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    phone: "+91 98765 43215",
    managerId: "usr_sarah"
  }
];

export const initialWorkflows = [
  {
    id: "wf_purchase_tier1",
    name: "Purchase: Low Value (< ₹50,000)",
    description: "Standard direct purchase requests requiring only direct manager sign-off.",
    requestType: "Purchase",
    minAmount: 0,
    maxAmount: 50000,
    departments: ["All"],
    priorities: ["All"],
    steps: [
      { stepOrder: 1, role: "manager", title: "Direct Manager Approval", slaHours: 24, autoEscalate: true }
    ],
    isActive: true,
    createdAt: "2026-01-10T10:00:00.000Z"
  },
  {
    id: "wf_purchase_tier2",
    name: "Purchase: Mid Value (₹50,000 to ₹2,00,000)",
    description: "Medium value procurement requiring Manager endorsement followed by Department Head approval.",
    requestType: "Purchase",
    minAmount: 50000,
    maxAmount: 200000,
    departments: ["All"],
    priorities: ["All"],
    steps: [
      { stepOrder: 1, role: "manager", title: "Direct Manager Review", slaHours: 24, autoEscalate: true },
      { stepOrder: 2, role: "department_head", title: "Department Head Authorization", slaHours: 48, autoEscalate: true }
    ],
    isActive: true,
    createdAt: "2026-01-10T10:00:00.000Z"
  },
  {
    id: "wf_purchase_tier3",
    name: "Purchase: High Value (> ₹2,00,000)",
    description: "Major capital expenditure requiring 4-tier governance: Manager, Department Head, Finance, and Executive Admin.",
    requestType: "Purchase",
    minAmount: 200000,
    maxAmount: 999999999,
    departments: ["All"],
    priorities: ["All"],
    steps: [
      { stepOrder: 1, role: "manager", title: "Manager Assessment", slaHours: 24, autoEscalate: true },
      { stepOrder: 2, role: "department_head", title: "Department Head Verification", slaHours: 24, autoEscalate: true },
      { stepOrder: 3, role: "finance", title: "Finance Budget Audit & Approval", slaHours: 24, autoEscalate: true },
      { stepOrder: 4, role: "admin", title: "Executive / Admin Final Authorization", slaHours: 24, autoEscalate: true }
    ],
    isActive: true,
    createdAt: "2026-01-10T10:00:00.000Z"
  },
  {
    id: "wf_expense_tier1",
    name: "Expense Reimbursement (< ₹25,000)",
    description: "Standard business travel, meals, and incidental expense claims.",
    requestType: "Expense",
    minAmount: 0,
    maxAmount: 25000,
    departments: ["All"],
    priorities: ["All"],
    steps: [
      { stepOrder: 1, role: "manager", title: "Manager Receipt Verification", slaHours: 24, autoEscalate: true }
    ],
    isActive: true,
    createdAt: "2026-01-10T10:00:00.000Z"
  },
  {
    id: "wf_expense_tier2",
    name: "Expense Reimbursement (≥ ₹25,000)",
    description: "High-value expense claims requiring both Manager sign-off and Finance disbursement review.",
    requestType: "Expense",
    minAmount: 25000,
    maxAmount: 999999999,
    departments: ["All"],
    priorities: ["All"],
    steps: [
      { stepOrder: 1, role: "manager", title: "Manager Validation", slaHours: 24, autoEscalate: true },
      { stepOrder: 2, role: "finance", title: "Finance Tax & Invoice Audit", slaHours: 24, autoEscalate: true }
    ],
    isActive: true,
    createdAt: "2026-01-10T10:00:00.000Z"
  },
  {
    id: "wf_discount",
    name: "Client Contract Discount Approval",
    description: "Commercial discount requests routed through Sales/Dept Lead and Finance risk assessment.",
    requestType: "Discount",
    minAmount: 0,
    maxAmount: 999999999,
    departments: ["All"],
    priorities: ["All"],
    steps: [
      { stepOrder: 1, role: "manager", title: "Sales / Team Lead Review", slaHours: 12, autoEscalate: true },
      { stepOrder: 2, role: "department_head", title: "VP / Dept Head Sanction", slaHours: 24, autoEscalate: true },
      { stepOrder: 3, role: "finance", title: "Finance Margin Analysis", slaHours: 24, autoEscalate: true }
    ],
    isActive: true,
    createdAt: "2026-01-10T10:00:00.000Z"
  },
  {
    id: "wf_it_support",
    name: "IT Support & Equipment Provisioning",
    description: "Hardware laptops, developer monitors, workstation assets, and software licenses.",
    requestType: "IT Support / Equipment",
    minAmount: 0,
    maxAmount: 999999999,
    departments: ["All"],
    priorities: ["All"],
    steps: [
      { stepOrder: 1, role: "manager", title: "Manager Needs Justification", slaHours: 24, autoEscalate: true },
      { stepOrder: 2, role: "department_head", title: "IT Asset / Head Allocation", slaHours: 24, autoEscalate: true }
    ],
    isActive: true,
    createdAt: "2026-01-10T10:00:00.000Z"
  },
  {
    id: "wf_resource",
    name: "Resource & Cloud Infrastructure Request",
    description: "Cloud credits, contractor allocation, and specialized development tool subscriptions.",
    requestType: "Resource",
    minAmount: 0,
    maxAmount: 999999999,
    departments: ["All"],
    priorities: ["All"],
    steps: [
      { stepOrder: 1, role: "manager", title: "Manager Capacity Review", slaHours: 24, autoEscalate: true },
      { stepOrder: 2, role: "department_head", title: "Dept Head Quota Approval", slaHours: 24, autoEscalate: true },
      { stepOrder: 3, role: "finance", title: "Finance Budget Allocation", slaHours: 24, autoEscalate: true }
    ],
    isActive: true,
    createdAt: "2026-01-10T10:00:00.000Z"
  },
  {
    id: "wf_leave",
    name: "Leave & Special Absence Request",
    description: "Annual leave, conference travel, sabbatical, or emergency time-off.",
    requestType: "Leave / Special",
    minAmount: 0,
    maxAmount: 999999999,
    departments: ["All"],
    priorities: ["All"],
    steps: [
      { stepOrder: 1, role: "manager", title: "Manager Coverage Review", slaHours: 48, autoEscalate: true }
    ],
    isActive: true,
    createdAt: "2026-01-10T10:00:00.000Z"
  }
];

export const initialRequests = [
  {
    id: "REQ-2026-0801",
    title: "AI Development Workstations & 4K UltraSharp Displays",
    requestType: "Purchase",
    amount: 345000,
    currency: "INR",
    department: "Engineering",
    priority: "Critical",
    description: "Procurement of two Apple M3 Max Studio systems with 64GB unified memory and dual Dell 32-inch 4K color-accurate displays for generative model fine-tuning and frontend rendering.",
    justification: "Critical for local model latency testing and cross-browser high-DPI validation before Q3 enterprise release.",
    customFields: {
      vendor: "Apple Business Enterprise & Dell India",
      itemCount: 4,
      deliveryLocation: "Bangalore Tech Hub - Floor 4"
    },
    createdBy: "usr_alex",
    creatorName: "Alex Johnson",
    creatorEmail: "alex.johnson@acmecorp.com",
    creatorDepartment: "Engineering",
    status: "Pending Finance Approval",
    currentStepIndex: 2,
    steps: [
      {
        stepOrder: 1,
        role: "manager",
        title: "Manager Assessment",
        status: "Approved",
        actorId: "usr_sarah",
        actorName: "Sarah Davis",
        actedAt: "2026-08-20T10:30:00.000Z",
        comment: "Fully endorsed. The AI team currently faces bottleneck during local build runs.",
        slaDeadline: "2026-08-20T14:30:00.000Z"
      },
      {
        stepOrder: 2,
        role: "department_head",
        title: "Department Head Verification",
        status: "Approved",
        actorId: "usr_michael",
        actorName: "Michael Chang",
        actedAt: "2026-08-20T16:15:00.000Z",
        comment: "Approved from Q3 capital equipment allocation budget.",
        slaDeadline: "2026-08-20T20:15:00.000Z"
      },
      {
        stepOrder: 3,
        role: "finance",
        title: "Finance Budget Audit & Approval",
        status: "Pending",
        actorId: null,
        actorName: null,
        actedAt: null,
        comment: null,
        slaDeadline: "2026-08-22T04:00:00.000Z"
      },
      {
        stepOrder: 4,
        role: "admin",
        title: "Executive / Admin Final Authorization",
        status: "Pending",
        actorId: null,
        actorName: null,
        actedAt: null,
        comment: null,
        slaDeadline: "2026-08-22T08:00:00.000Z"
      }
    ],
    documents: [
      {
        id: "doc_1",
        name: "Apple_Quotation_AUG2026.pdf",
        size: "1.4 MB",
        type: "application/pdf",
        uploadedAt: "2026-08-20T09:12:00.000Z"
      },
      {
        id: "doc_2",
        name: "Dell_Displays_Specs.pdf",
        size: "820 KB",
        type: "application/pdf",
        uploadedAt: "2026-08-20T09:15:00.000Z"
      }
    ],
    auditLogs: [
      { id: "log_1", action: "Submitted", actor: "Alex Johnson", timestamp: "2026-08-20T09:15:00.000Z", details: "Request submitted with 4-tier approval path calculated." },
      { id: "log_2", action: "Approved", actor: "Sarah Davis (Manager)", timestamp: "2026-08-20T10:30:00.000Z", details: "Stage 1 approved: 'Fully endorsed. The AI team currently faces bottleneck during local build runs.'" },
      { id: "log_3", action: "Approved", actor: "Michael Chang (Dept Head)", timestamp: "2026-08-20T16:15:00.000Z", details: "Stage 2 approved: 'Approved from Q3 capital equipment allocation budget.'" },
      { id: "log_4", action: "Assigned", actor: "System Engine", timestamp: "2026-08-20T16:15:05.000Z", details: "Assigned to Finance Team for Stage 3 review." }
    ],
    createdAt: "2026-08-20T09:15:00.000Z",
    updatedAt: "2026-08-20T16:15:05.000Z",
    slaTotalHours: 4,
    slaExpiresAt: "2026-08-22T04:00:00.000Z",
    isEscalated: false,
    isDelayed: false
  },
  {
    id: "REQ-2026-0802",
    title: "Client Onboarding Summit - Team Travel & Accommodation",
    requestType: "Expense",
    amount: 48500,
    currency: "INR",
    department: "Engineering",
    priority: "High",
    description: "Travel expenses, flight booking, and 3 nights hotel accommodation in Mumbai for 2 lead engineers attending the strategic enterprise client rollout.",
    justification: "On-site architecture signoff requested by Fortune 500 client sponsor.",
    customFields: {
      expenseCategory: "Travel & Lodging",
      expenseDate: "2026-08-28",
      receiptCount: 5
    },
    createdBy: "usr_alex",
    creatorName: "Alex Johnson",
    creatorEmail: "alex.johnson@acmecorp.com",
    creatorDepartment: "Engineering",
    status: "Pending Manager Approval",
    currentStepIndex: 0,
    steps: [
      {
        stepOrder: 1,
        role: "manager",
        title: "Manager Validation",
        status: "Pending",
        actorId: null,
        actorName: null,
        actedAt: null,
        comment: null,
        slaDeadline: "2026-08-22T12:00:00.000Z"
      },
      {
        stepOrder: 2,
        role: "finance",
        title: "Finance Tax & Invoice Audit",
        status: "Pending",
        actorId: null,
        actorName: null,
        actedAt: null,
        comment: null,
        slaDeadline: "2026-08-23T12:00:00.000Z"
      }
    ],
    documents: [
      {
        id: "doc_3",
        name: "Flight_Hotel_Invoices_Bundle.pdf",
        size: "3.2 MB",
        type: "application/pdf",
        uploadedAt: "2026-08-21T08:00:00.000Z"
      }
    ],
    auditLogs: [
      { id: "log_5", action: "Submitted", actor: "Alex Johnson", timestamp: "2026-08-21T08:00:00.000Z", details: "Expense reimbursement submitted for ₹48,500." }
    ],
    createdAt: "2026-08-21T08:00:00.000Z",
    updatedAt: "2026-08-21T08:00:00.000Z",
    slaTotalHours: 24,
    slaExpiresAt: "2026-08-22T12:00:00.000Z",
    isEscalated: false,
    isDelayed: false
  },
  {
    id: "REQ-2026-0803",
    title: "Global Enterprise Multi-Year Contract - 22% Volume Discount",
    requestType: "Discount",
    amount: 1850000,
    currency: "INR",
    department: "Sales",
    priority: "Critical",
    description: "Custom contract pricing discount for FinTech Corp. Standard list price ₹23,70,000 discounted to ₹18,50,000 in exchange for a 36-month upfront annual prepayment.",
    justification: "Secures 3-year recurring ACV with minimum guaranteed seat expansion in Year 2.",
    customFields: {
      clientName: "FinTech Corp Global",
      discountPercentage: "22%",
      contractTermMonths: 36
    },
    createdBy: "usr_elena",
    creatorName: "Elena Rostova",
    creatorEmail: "elena.r@acmecorp.com",
    creatorDepartment: "Marketing",
    status: "More Information Required",
    currentStepIndex: 0,
    steps: [
      {
        stepOrder: 1,
        role: "manager",
        title: "Sales / Team Lead Review",
        status: "More Information Required",
        actorId: "usr_sarah",
        actorName: "Sarah Davis",
        actedAt: "2026-08-21T11:00:00.000Z",
        comment: "Please attach the comparative competitor price breakdown and confirm whether premium SLA support is bundled.",
        slaDeadline: "2026-08-21T15:00:00.000Z"
      },
      {
        stepOrder: 2,
        role: "department_head",
        title: "VP / Dept Head Sanction",
        status: "Pending",
        actorId: null,
        actorName: null,
        actedAt: null,
        comment: null,
        slaDeadline: "2026-08-22T15:00:00.000Z"
      },
      {
        stepOrder: 3,
        role: "finance",
        title: "Finance Margin Analysis",
        status: "Pending",
        actorId: null,
        actorName: null,
        actedAt: null,
        comment: null,
        slaDeadline: "2026-08-23T15:00:00.000Z"
      }
    ],
    documents: [
      {
        id: "doc_4",
        name: "FinTechCorp_Draft_MSA.pdf",
        size: "950 KB",
        type: "application/pdf",
        uploadedAt: "2026-08-21T10:15:00.000Z"
      }
    ],
    auditLogs: [
      { id: "log_6", action: "Submitted", actor: "Elena Rostova", timestamp: "2026-08-21T10:15:00.000Z", details: "Discount request submitted." },
      { id: "log_7", action: "More Information Required", actor: "Sarah Davis (Manager)", timestamp: "2026-08-21T11:00:00.000Z", details: "Comment: 'Please attach the comparative competitor price breakdown and confirm whether premium SLA support is bundled.'" }
    ],
    createdAt: "2026-08-21T10:15:00.000Z",
    updatedAt: "2026-08-21T11:00:00.000Z",
    slaTotalHours: 4,
    slaExpiresAt: "2026-08-21T15:00:00.000Z",
    isEscalated: false,
    isDelayed: false
  },
  {
    id: "REQ-2026-0804",
    title: "Database Cluster High Availability Infrastructure Upgrade",
    requestType: "Purchase",
    amount: 145000,
    currency: "INR",
    department: "Engineering",
    priority: "Medium",
    description: "Purchase of NVMe SSD array nodes and redundant network switches for primary PostgreSQL cluster failover.",
    justification: "Prevents downtime risk as active transaction throughput doubled this quarter.",
    customFields: {
      vendor: "SysNet Infrastructure India",
      itemCount: 6,
      rackLocation: "Rack B-14, Primary DC"
    },
    createdBy: "usr_alex",
    creatorName: "Alex Johnson",
    creatorEmail: "alex.johnson@acmecorp.com",
    creatorDepartment: "Engineering",
    status: "Pending Department Head Approval",
    currentStepIndex: 1,
    steps: [
      {
        stepOrder: 1,
        role: "manager",
        title: "Direct Manager Review",
        status: "Approved",
        actorId: "usr_sarah",
        actorName: "Sarah Davis",
        actedAt: "2026-08-19T14:20:00.000Z",
        comment: "Architecture committee reviewed and approved equipment specifications.",
        slaDeadline: "2026-08-21T14:20:00.000Z"
      },
      {
        stepOrder: 2,
        role: "department_head",
        title: "Department Head Authorization",
        status: "Pending",
        actorId: null,
        actorName: null,
        actedAt: null,
        comment: null,
        slaDeadline: "2026-08-23T14:20:00.000Z"
      }
    ],
    documents: [
      {
        id: "doc_5",
        name: "SysNet_Hardware_Quote.pdf",
        size: "1.1 MB",
        type: "application/pdf",
        uploadedAt: "2026-08-19T11:00:00.000Z"
      }
    ],
    auditLogs: [
      { id: "log_8", action: "Submitted", actor: "Alex Johnson", timestamp: "2026-08-19T11:00:00.000Z", details: "Purchase request submitted for ₹1,45,000." },
      { id: "log_9", action: "Approved", actor: "Sarah Davis (Manager)", timestamp: "2026-08-19T14:20:00.000Z", details: "Step 1 approved." }
    ],
    createdAt: "2026-08-19T11:00:00.000Z",
    updatedAt: "2026-08-19T14:20:00.000Z",
    slaTotalHours: 48,
    slaExpiresAt: "2026-08-23T14:20:00.000Z",
    isEscalated: false,
    isDelayed: false
  },
  {
    id: "REQ-2026-0805",
    title: "Edge Compute Gateway Firmware Test Hardware",
    requestType: "Purchase",
    amount: 38000,
    currency: "INR",
    department: "Engineering",
    priority: "Low",
    description: "Purchase of 5 IoT edge testing gateways and CAN-bus debuggers for hardware lab testing.",
    justification: "Required for new firmware regression suite.",
    customFields: {
      vendor: "DigiKey Electronics",
      itemCount: 5
    },
    createdBy: "usr_alex",
    creatorName: "Alex Johnson",
    creatorEmail: "alex.johnson@acmecorp.com",
    creatorDepartment: "Engineering",
    status: "Approved",
    currentStepIndex: 0,
    steps: [
      {
        stepOrder: 1,
        role: "manager",
        title: "Direct Manager Approval",
        status: "Approved",
        actorId: "usr_sarah",
        actorName: "Sarah Davis",
        actedAt: "2026-08-18T16:00:00.000Z",
        comment: "Approved. Fast-tracked since it is well within team discretionary equipment budget.",
        slaDeadline: "2026-08-21T16:00:00.000Z"
      }
    ],
    documents: [
      {
        id: "doc_6",
        name: "DigiKey_Invoice_AUG.pdf",
        size: "640 KB",
        type: "application/pdf",
        uploadedAt: "2026-08-18T10:00:00.000Z"
      }
    ],
    auditLogs: [
      { id: "log_10", action: "Submitted", actor: "Alex Johnson", timestamp: "2026-08-18T10:00:00.000Z", details: "Submitted request for ₹38,000." },
      { id: "log_11", action: "Approved", actor: "Sarah Davis (Manager)", timestamp: "2026-08-18T16:00:00.000Z", details: "All approval steps completed. Request Status: Approved." }
    ],
    createdAt: "2026-08-18T10:00:00.000Z",
    updatedAt: "2026-08-18T16:00:00.000Z",
    slaTotalHours: 72,
    slaExpiresAt: "2026-08-21T16:00:00.000Z",
    isEscalated: false,
    isDelayed: false
  },
  {
    id: "REQ-2026-0806",
    title: "Kubernetes Cloud GPU Cluster Monthly Quota",
    requestType: "Resource",
    amount: 520000,
    currency: "INR",
    department: "Engineering",
    priority: "Critical",
    description: "Provisioning 8x NVIDIA H100 GPU nodes on Google Cloud Platform for automated pipeline training runs.",
    justification: "Model training jobs queued up due to compute shortage.",
    customFields: {
      cloudProvider: "Google Cloud Platform",
      billingAccount: "CORP-GCP-PROD-99"
    },
    createdBy: "usr_alex",
    creatorName: "Alex Johnson",
    creatorEmail: "alex.johnson@acmecorp.com",
    creatorDepartment: "Engineering",
    status: "Escalated",
    currentStepIndex: 1,
    steps: [
      {
        stepOrder: 1,
        role: "manager",
        title: "Manager Capacity Review",
        status: "Approved",
        actorId: "usr_sarah",
        actorName: "Sarah Davis",
        actedAt: "2026-08-19T08:30:00.000Z",
        comment: "Endorsed urgently due to training deadline.",
        slaDeadline: "2026-08-19T12:30:00.000Z"
      },
      {
        stepOrder: 2,
        role: "department_head",
        title: "Dept Head Quota Approval",
        status: "Escalated",
        actorId: null,
        actorName: null,
        actedAt: null,
        comment: "SLA Deadline (4h) breached. Automatically escalated to Executive Admin for priority override.",
        slaDeadline: "2026-08-19T16:30:00.000Z"
      },
      {
        stepOrder: 3,
        role: "finance",
        title: "Finance Budget Allocation",
        status: "Pending",
        actorId: null,
        actorName: null,
        actedAt: null,
        comment: null,
        slaDeadline: "2026-08-19T20:30:00.000Z"
      }
    ],
    documents: [
      {
        id: "doc_7",
        name: "GCP_GPU_Cost_Forecast.pdf",
        size: "1.8 MB",
        type: "application/pdf",
        uploadedAt: "2026-08-19T08:00:00.000Z"
      }
    ],
    auditLogs: [
      { id: "log_12", action: "Submitted", actor: "Alex Johnson", timestamp: "2026-08-19T08:00:00.000Z", details: "Resource request submitted." },
      { id: "log_13", action: "Approved", actor: "Sarah Davis (Manager)", timestamp: "2026-08-19T08:30:00.000Z", details: "Step 1 approved." },
      { id: "log_14", action: "SLA Breached", actor: "System Escalation Watchdog", timestamp: "2026-08-19T16:30:00.000Z", details: "SLA exceeded at Step 2 (Dept Head). Status escalated to Executive Admin." }
    ],
    createdAt: "2026-08-19T08:00:00.000Z",
    updatedAt: "2026-08-19T16:30:00.000Z",
    slaTotalHours: 4,
    slaExpiresAt: "2026-08-19T16:30:00.000Z",
    isEscalated: true,
    isDelayed: true
  },
  {
    id: "REQ-2026-0807",
    title: "Annual Tech Conference Speaker Travel & Pass",
    requestType: "Leave / Special",
    amount: 65000,
    currency: "INR",
    department: "Engineering",
    priority: "Medium",
    description: "Request for 4 days special leave and conference registration sponsorship to present our distributed systems paper.",
    justification: "Keynote presentation representing company open-source contributions.",
    customFields: {
      leaveDates: "2026-09-15 to 2026-09-18",
      leaveType: "Conference / Special",
      coverageAssignedTo: "Elena Rostova"
    },
    createdBy: "usr_alex",
    creatorName: "Alex Johnson",
    creatorEmail: "alex.johnson@acmecorp.com",
    creatorDepartment: "Engineering",
    status: "Pending Manager Approval",
    currentStepIndex: 0,
    steps: [
      {
        stepOrder: 1,
        role: "manager",
        title: "Manager Coverage Review",
        status: "Pending",
        actorId: null,
        actorName: null,
        actedAt: null,
        comment: null,
        slaDeadline: "2026-08-23T10:00:00.000Z"
      }
    ],
    documents: [
      {
        id: "doc_8",
        name: "Conference_Acceptance_Letter.pdf",
        size: "450 KB",
        type: "application/pdf",
        uploadedAt: "2026-08-21T07:30:00.000Z"
      }
    ],
    auditLogs: [
      { id: "log_15", action: "Submitted", actor: "Alex Johnson", timestamp: "2026-08-21T07:30:00.000Z", details: "Leave request submitted." }
    ],
    createdAt: "2026-08-21T07:30:00.000Z",
    updatedAt: "2026-08-21T07:30:00.000Z",
    slaTotalHours: 48,
    slaExpiresAt: "2026-08-23T10:00:00.000Z",
    isEscalated: false,
    isDelayed: false
  },
  {
    id: "REQ-2026-0808",
    title: "Non-standard Personal Mechanical Keyboard Reimbursement",
    requestType: "Expense",
    amount: 19500,
    currency: "INR",
    department: "Marketing",
    priority: "Low",
    description: "Custom ergonomic custom keyboard imported from overseas vendor without itemized GST bill.",
    justification: "Requested by team member for desk setup.",
    customFields: {
      expenseCategory: "Office Supplies",
      receiptCount: 1
    },
    createdBy: "usr_elena",
    creatorName: "Elena Rostova",
    creatorEmail: "elena.r@acmecorp.com",
    creatorDepartment: "Marketing",
    status: "Rejected",
    currentStepIndex: 0,
    steps: [
      {
        stepOrder: 1,
        role: "manager",
        title: "Manager Receipt Verification",
        status: "Rejected",
        actorId: "usr_sarah",
        actorName: "Sarah Davis",
        actedAt: "2026-08-17T15:10:00.000Z",
        comment: "Standard ergonomic keyboards are pre-stocked in IT inventory. Non-GST overseas imports cannot be reimbursed per company expense policy.",
        slaDeadline: "2026-08-20T10:00:00.000Z"
      }
    ],
    documents: [],
    auditLogs: [
      { id: "log_16", action: "Submitted", actor: "Elena Rostova", timestamp: "2026-08-17T10:00:00.000Z", details: "Expense claim submitted." },
      { id: "log_17", action: "Rejected", actor: "Sarah Davis (Manager)", timestamp: "2026-08-17T15:10:00.000Z", details: "Request rejected: Non-compliant with equipment procurement policy." }
    ],
    createdAt: "2026-08-17T10:00:00.000Z",
    updatedAt: "2026-08-17T15:10:00.000Z",
    slaTotalHours: 72,
    slaExpiresAt: "2026-08-20T10:00:00.000Z",
    isEscalated: false,
    isDelayed: false
  }
];

export const initialNotifications = [
  {
    id: "notif_1",
    userId: "usr_priya",
    title: "New Finance Approval Pending",
    message: "Purchase request REQ-2026-0801 (₹3,45,000) was approved by Dept Head and requires Finance review.",
    type: "approval_needed",
    requestId: "REQ-2026-0801",
    isRead: false,
    createdAt: "2026-08-20T16:15:05.000Z"
  },
  {
    id: "notif_2",
    userId: "usr_sarah",
    title: "Expense Request Submitted",
    message: "Alex Johnson submitted travel reimbursement REQ-2026-0802 for ₹48,500.",
    type: "new_request",
    requestId: "REQ-2026-0802",
    isRead: false,
    createdAt: "2026-08-21T08:00:00.000Z"
  },
  {
    id: "notif_3",
    userId: "usr_david",
    title: "SLA Breached & Escalated",
    message: "Resource request REQ-2026-0806 (₹5,20,000) breached 4-hour Critical SLA and has been escalated to you.",
    type: "sla_breach",
    requestId: "REQ-2026-0806",
    isRead: false,
    createdAt: "2026-08-19T16:30:00.000Z"
  },
  {
    id: "notif_4",
    userId: "usr_alex",
    title: "Request Stage Approved",
    message: "Your purchase request REQ-2026-0801 has been approved by Michael Chang (Dept Head).",
    type: "request_approved",
    requestId: "REQ-2026-0801",
    isRead: true,
    createdAt: "2026-08-20T16:15:00.000Z"
  },
  {
    id: "notif_5",
    userId: "usr_elena",
    title: "More Information Requested",
    message: "Sarah Davis requested additional information on discount request REQ-2026-0803.",
    type: "info_requested",
    requestId: "REQ-2026-0803",
    isRead: false,
    createdAt: "2026-08-21T11:00:00.000Z"
  }
];
