export const inspectionTabs= [
{
    key: "History",
    label: "History",
     subIssues: [
      { key: "vinInspection", label: "VIN Inspection" },
      { key: "serviceRecalls", label: "Service Recalls Performed" },
      { key: "vehicleHistory", label: "Vehicle History Obtained" }, 
     ],
},
 {
    key: "exterior",
    label: "Exterior",
    subIssues: [
      { key: "paintCondition", label: "Paint Condition" },
      { key: "bodyDamage", label: "Body Damage" },
      { key: "glassCondition", label: "Glass Condition" },
    ],
  },
{
    key: "interior",
    label: "Interior",
    subIssues: [
      { key: "upholsteryCondition", label: "Upholstery Condition" },
      { key: "dashboardCondition", label: "Dashboard Condition" },
      { key: "controlsFunctionality", label: "Controls Functionality" },
    ],
  },
  {
    key: "engine",
    label: "Engine and Mechanical",
    subIssues: [
      { key: "fluidLeaks", label: "Fluid Leaks" },
      { key: "beltCondition", label: "Belt Condition" },
      { key: "hoseCondition", label: "Hose Condition" },
    ],
  },
  {
    key: "tires",
    label: "Tires and Wheels",
    subIssues: [
      { key: "tireTreadDepth", label: "Tire Tread Depth" },
      { key: "wheelCondition", label: "Wheel Condition" },
      { key: "tirePressure", label: "Tire Pressure" },
    ],
  },
  {
    key: "brakes",
    label: "Brakes and Suspension",
    subIssues: [
      { key: "brakePadCondition", label: "Brake Pad Condition" },
      { key: "suspensionCondition", label: "Suspension Condition" },
      { key: "brakeFluidLevel", label: "Brake Fluid Level" },
    ],
  },
]