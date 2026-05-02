import { getDb } from "../api/queries/connection";
import { countries, safetyAlerts } from "./schema";

const COUNTRIES_DATA: {
  name: string;
  code: string;
  flag: string;
  region: string;
  latitude: string;
  longitude: string;
  overallScore: number;
  crimeRate: number;
  healthcareScore: number;
  politicalStability: number;
  naturalDisasterRisk: number;
  advisoryLevel: "safe" | "moderate" | "high_risk" | "critical";
  travelAdvisory: string;
}[] = [
  { name: "Afghanistan", code: "AFG", flag: "🇦🇫", region: "Middle East & Africa", latitude: "34.525", longitude: "69.178", overallScore: 15, crimeRate: 20, healthcareScore: 15, politicalStability: 10, naturalDisasterRisk: 55, advisoryLevel: "critical", travelAdvisory: "Avoid all travel. Extremely dangerous security situation." },
  { name: "Albania", code: "ALB", flag: "🇦🇱", region: "Europe", latitude: "41.327", longitude: "19.819", overallScore: 72, crimeRate: 65, healthcareScore: 60, politicalStability: 70, naturalDisasterRisk: 50, advisoryLevel: "moderate", travelAdvisory: "Exercise normal precautions. Be aware of petty crime." },
  { name: "Algeria", code: "DZA", flag: "🇩🇿", region: "Middle East & Africa", latitude: "36.753", longitude: "3.059", overallScore: 58, crimeRate: 55, healthcareScore: 50, politicalStability: 55, naturalDisasterRisk: 45, advisoryLevel: "moderate", travelAdvisory: "Exercise increased caution due to terrorism." },
  { name: "Argentina", code: "ARG", flag: "🇦🇷", region: "Americas", latitude: "-34.604", longitude: "-58.382", overallScore: 65, crimeRate: 55, healthcareScore: 70, politicalStability: 60, naturalDisasterRisk: 50, advisoryLevel: "moderate", travelAdvisory: "Exercise increased caution due to petty crime." },
  { name: "Australia", code: "AUS", flag: "🇦🇺", region: "Asia Pacific", latitude: "-35.282", longitude: "149.129", overallScore: 92, crimeRate: 85, healthcareScore: 95, politicalStability: 90, naturalDisasterRisk: 60, advisoryLevel: "safe", travelAdvisory: "Exercise normal precautions. High standard of safety." },
  { name: "Austria", code: "AUT", flag: "🇦🇹", region: "Europe", latitude: "48.208", longitude: "16.374", overallScore: 94, crimeRate: 90, healthcareScore: 92, politicalStability: 95, naturalDisasterRisk: 55, advisoryLevel: "safe", travelAdvisory: "Exercise normal precautions. Very safe destination." },
  { name: "Bangladesh", code: "BGD", flag: "🇧🇩", region: "Asia Pacific", latitude: "23.810", longitude: "90.413", overallScore: 50, crimeRate: 50, healthcareScore: 40, politicalStability: 55, naturalDisasterRisk: 45, advisoryLevel: "moderate", travelAdvisory: "Exercise increased caution due to crime and political unrest." },
  { name: "Belgium", code: "BEL", flag: "🇧🇪", region: "Europe", latitude: "50.850", longitude: "4.352", overallScore: 88, crimeRate: 80, healthcareScore: 92, politicalStability: 85, naturalDisasterRisk: 50, advisoryLevel: "safe", travelAdvisory: "Exercise normal precautions. Be aware of petty crime in tourist areas." },
  { name: "Brazil", code: "BRA", flag: "🇧🇷", region: "Americas", latitude: "-15.797", longitude: "-47.882", overallScore: 58, crimeRate: 45, healthcareScore: 60, politicalStability: 65, naturalDisasterRisk: 50, advisoryLevel: "moderate", travelAdvisory: "Exercise increased caution due to crime. Avoid favelas." },
  { name: "Canada", code: "CAN", flag: "🇨🇦", region: "Americas", latitude: "45.421", longitude: "-75.697", overallScore: 94, crimeRate: 88, healthcareScore: 92, politicalStability: 95, naturalDisasterRisk: 55, advisoryLevel: "safe", travelAdvisory: "Exercise normal precautions. Very safe destination." },
  { name: "Chile", code: "CHL", flag: "🇨🇱", region: "Americas", latitude: "-33.437", longitude: "-70.651", overallScore: 75, crimeRate: 70, healthcareScore: 75, politicalStability: 75, naturalDisasterRisk: 45, advisoryLevel: "safe", travelAdvisory: "Exercise normal precautions. Be aware of petty crime." },
  { name: "China", code: "CHN", flag: "🇨🇳", region: "Asia Pacific", latitude: "39.904", longitude: "116.407", overallScore: 72, crimeRate: 75, healthcareScore: 65, politicalStability: 80, naturalDisasterRisk: 50, advisoryLevel: "moderate", travelAdvisory: "Exercise increased caution due to arbitrary enforcement of laws." },
  { name: "Colombia", code: "COL", flag: "🇨🇴", region: "Americas", latitude: "4.711", longitude: "-74.072", overallScore: 62, crimeRate: 50, healthcareScore: 65, politicalStability: 65, naturalDisasterRisk: 55, advisoryLevel: "moderate", travelAdvisory: "Exercise increased caution due to crime and terrorism." },
  { name: "Costa Rica", code: "CRI", flag: "🇨🇷", region: "Americas", latitude: "9.928", longitude: "-84.091", overallScore: 82, crimeRate: 75, healthcareScore: 80, politicalStability: 85, naturalDisasterRisk: 50, advisoryLevel: "safe", travelAdvisory: "Exercise normal precautions. Be aware of petty crime." },
  { name: "Croatia", code: "HRV", flag: "🇭🇷", region: "Europe", latitude: "45.815", longitude: "15.982", overallScore: 88, crimeRate: 85, healthcareScore: 82, politicalStability: 85, naturalDisasterRisk: 55, advisoryLevel: "safe", travelAdvisory: "Exercise normal precautions. Safe tourist destination." },
  { name: "Czech Republic", code: "CZE", flag: "🇨🇿", region: "Europe", latitude: "50.075", longitude: "14.438", overallScore: 90, crimeRate: 85, healthcareScore: 85, politicalStability: 90, naturalDisasterRisk: 60, advisoryLevel: "safe", travelAdvisory: "Exercise normal precautions. Very safe destination." },
  { name: "Denmark", code: "DNK", flag: "🇩🇰", region: "Europe", latitude: "55.676", longitude: "12.568", overallScore: 95, crimeRate: 90, healthcareScore: 95, politicalStability: 95, naturalDisasterRisk: 55, advisoryLevel: "safe", travelAdvisory: "Exercise normal precautions. One of the safest countries." },
  { name: "Egypt", code: "EGY", flag: "🇪🇬", region: "Middle East & Africa", latitude: "30.045", longitude: "31.236", overallScore: 52, crimeRate: 50, healthcareScore: 45, politicalStability: 50, naturalDisasterRisk: 55, advisoryLevel: "moderate", travelAdvisory: "Exercise increased caution due to terrorism." },
  { name: "Finland", code: "FIN", flag: "🇫🇮", region: "Europe", latitude: "60.170", longitude: "24.938", overallScore: 96, crimeRate: 92, healthcareScore: 95, politicalStability: 95, naturalDisasterRisk: 55, advisoryLevel: "safe", travelAdvisory: "Exercise normal precautions. Extremely safe destination." },
  { name: "France", code: "FRA", flag: "🇫🇷", region: "Europe", latitude: "48.857", longitude: "2.352", overallScore: 84, crimeRate: 75, healthcareScore: 92, politicalStability: 80, naturalDisasterRisk: 55, advisoryLevel: "safe", travelAdvisory: "Exercise normal precautions. Be aware of petty crime in major cities." },
  { name: "Germany", code: "DEU", flag: "🇩🇪", region: "Europe", latitude: "52.520", longitude: "13.405", overallScore: 92, crimeRate: 85, healthcareScore: 92, politicalStability: 90, naturalDisasterRisk: 55, advisoryLevel: "safe", travelAdvisory: "Exercise normal precautions. Very safe destination." },
  { name: "Greece", code: "GRC", flag: "🇬🇷", region: "Europe", latitude: "37.984", longitude: "23.728", overallScore: 85, crimeRate: 80, healthcareScore: 82, politicalStability: 80, naturalDisasterRisk: 50, advisoryLevel: "safe", travelAdvisory: "Exercise normal precautions. Safe tourist destination." },
  { name: "Hungary", code: "HUN", flag: "🇭🇺", region: "Europe", latitude: "47.498", longitude: "19.040", overallScore: 86, crimeRate: 80, healthcareScore: 78, politicalStability: 80, naturalDisasterRisk: 55, advisoryLevel: "safe", travelAdvisory: "Exercise normal precautions. Be aware of petty crime." },
  { name: "Iceland", code: "ISL", flag: "🇮🇸", region: "Europe", latitude: "64.146", longitude: "-21.942", overallScore: 97, crimeRate: 95, healthcareScore: 92, politicalStability: 95, naturalDisasterRisk: 50, advisoryLevel: "safe", travelAdvisory: "Exercise normal precautions. One of the safest countries in the world." },
  { name: "India", code: "IND", flag: "🇮🇳", region: "Asia Pacific", latitude: "28.614", longitude: "77.209", overallScore: 58, crimeRate: 50, healthcareScore: 50, politicalStability: 65, naturalDisasterRisk: 45, advisoryLevel: "moderate", travelAdvisory: "Exercise increased caution due to crime and terrorism." },
  { name: "Indonesia", code: "IDN", flag: "🇮🇩", region: "Asia Pacific", latitude: "-6.208", longitude: "106.846", overallScore: 65, crimeRate: 60, healthcareScore: 55, politicalStability: 70, naturalDisasterRisk: 55, advisoryLevel: "moderate", travelAdvisory: "Exercise increased caution due to terrorism and natural disasters." },
  { name: "Ireland", code: "IRL", flag: "🇮🇪", region: "Europe", latitude: "53.350", longitude: "-6.260", overallScore: 92, crimeRate: 85, healthcareScore: 88, politicalStability: 90, naturalDisasterRisk: 60, advisoryLevel: "safe", travelAdvisory: "Exercise normal precautions. Very safe destination." },
  { name: "Israel", code: "ISR", flag: "🇮🇱", region: "Middle East & Africa", latitude: "31.768", longitude: "35.214", overallScore: 55, crimeRate: 60, healthcareScore: 90, politicalStability: 35, naturalDisasterRisk: 55, advisoryLevel: "high_risk", travelAdvisory: "Reconsider travel due to terrorism and armed conflict." },
  { name: "Italy", code: "ITA", flag: "🇮🇹", region: "Europe", latitude: "41.902", longitude: "12.496", overallScore: 86, crimeRate: 75, healthcareScore: 90, politicalStability: 80, naturalDisasterRisk: 55, advisoryLevel: "safe", travelAdvisory: "Exercise normal precautions. Be aware of petty crime in tourist areas." },
  { name: "Japan", code: "JPN", flag: "🇯🇵", region: "Asia Pacific", latitude: "35.676", longitude: "139.650", overallScore: 94, crimeRate: 95, healthcareScore: 92, politicalStability: 90, naturalDisasterRisk: 45, advisoryLevel: "safe", travelAdvisory: "Exercise normal precautions. Very safe but be prepared for earthquakes." },
  { name: "Kenya", code: "KEN", flag: "🇰🇪", region: "Middle East & Africa", latitude: "-1.292", longitude: "36.822", overallScore: 52, crimeRate: 45, healthcareScore: 40, politicalStability: 55, naturalDisasterRisk: 55, advisoryLevel: "moderate", travelAdvisory: "Exercise increased caution due to crime and terrorism." },
  { name: "Malaysia", code: "MYS", flag: "🇲🇾", region: "Asia Pacific", latitude: "3.139", longitude: "101.687", overallScore: 75, crimeRate: 70, healthcareScore: 72, politicalStability: 75, naturalDisasterRisk: 50, advisoryLevel: "safe", travelAdvisory: "Exercise normal precautions. Be aware of petty crime." },
  { name: "Mexico", code: "MEX", flag: "🇲🇽", region: "Americas", latitude: "19.433", longitude: "-99.133", overallScore: 55, crimeRate: 40, healthcareScore: 60, politicalStability: 60, naturalDisasterRisk: 50, advisoryLevel: "moderate", travelAdvisory: "Exercise increased caution due to crime. Avoid certain states." },
  { name: "Morocco", code: "MAR", flag: "🇲🇦", region: "Middle East & Africa", latitude: "34.020", longitude: "-6.841", overallScore: 68, crimeRate: 65, healthcareScore: 55, politicalStability: 70, naturalDisasterRisk: 50, advisoryLevel: "moderate", travelAdvisory: "Exercise increased caution. Be aware of petty crime and scams." },
  { name: "Netherlands", code: "NLD", flag: "🇳🇱", region: "Europe", latitude: "52.367", longitude: "4.905", overallScore: 92, crimeRate: 80, healthcareScore: 92, politicalStability: 90, naturalDisasterRisk: 55, advisoryLevel: "safe", travelAdvisory: "Exercise normal precautions. Be aware of petty crime in Amsterdam." },
  { name: "New Zealand", code: "NZL", flag: "🇳🇿", region: "Asia Pacific", latitude: "-41.286", longitude: "174.776", overallScore: 95, crimeRate: 88, healthcareScore: 92, politicalStability: 92, naturalDisasterRisk: 55, advisoryLevel: "safe", travelAdvisory: "Exercise normal precautions. Very safe destination." },
  { name: "Nigeria", code: "NGA", flag: "🇳🇬", region: "Middle East & Africa", latitude: "9.058", longitude: "7.398", overallScore: 35, crimeRate: 30, healthcareScore: 25, politicalStability: 40, naturalDisasterRisk: 55, advisoryLevel: "high_risk", travelAdvisory: "Reconsider travel due to crime, terrorism, and civil unrest." },
  { name: "Norway", code: "NOR", flag: "🇳🇴", region: "Europe", latitude: "59.913", longitude: "10.752", overallScore: 96, crimeRate: 90, healthcareScore: 95, politicalStability: 95, naturalDisasterRisk: 55, advisoryLevel: "safe", travelAdvisory: "Exercise normal precautions. Extremely safe destination." },
  { name: "Pakistan", code: "PAK", flag: "🇵🇰", region: "Asia Pacific", latitude: "33.684", longitude: "73.048", overallScore: 40, crimeRate: 40, healthcareScore: 35, politicalStability: 35, naturalDisasterRisk: 50, advisoryLevel: "high_risk", travelAdvisory: "Reconsider travel due to terrorism and sectarian violence." },
  { name: "Peru", code: "PER", flag: "🇵🇪", region: "Americas", latitude: "-12.046", longitude: "-77.043", overallScore: 65, crimeRate: 55, healthcareScore: 60, politicalStability: 60, naturalDisasterRisk: 55, advisoryLevel: "moderate", travelAdvisory: "Exercise increased caution due to crime and civil unrest." },
  { name: "Philippines", code: "PHL", flag: "🇵🇭", region: "Asia Pacific", latitude: "14.599", longitude: "120.984", overallScore: 58, crimeRate: 50, healthcareScore: 50, politicalStability: 60, naturalDisasterRisk: 50, advisoryLevel: "moderate", travelAdvisory: "Exercise increased caution due to crime, terrorism, and civil unrest." },
  { name: "Poland", code: "POL", flag: "🇵🇱", region: "Europe", latitude: "52.230", longitude: "21.012", overallScore: 88, crimeRate: 82, healthcareScore: 75, politicalStability: 80, naturalDisasterRisk: 55, advisoryLevel: "safe", travelAdvisory: "Exercise normal precautions. Safe destination." },
  { name: "Portugal", code: "PRT", flag: "🇵🇹", region: "Europe", latitude: "38.722", longitude: "-9.139", overallScore: 90, crimeRate: 85, healthcareScore: 85, politicalStability: 85, naturalDisasterRisk: 50, advisoryLevel: "safe", travelAdvisory: "Exercise normal precautions. Very safe destination." },
  { name: "Qatar", code: "QAT", flag: "🇶🇦", region: "Middle East & Africa", latitude: "25.285", longitude: "51.531", overallScore: 85, crimeRate: 88, healthcareScore: 82, politicalStability: 80, naturalDisasterRisk: 50, advisoryLevel: "safe", travelAdvisory: "Exercise normal precautions. Very low crime rate." },
  { name: "Romania", code: "ROU", flag: "🇷🇴", region: "Europe", latitude: "44.427", longitude: "26.102", overallScore: 80, crimeRate: 75, healthcareScore: 65, politicalStability: 75, naturalDisasterRisk: 55, advisoryLevel: "safe", travelAdvisory: "Exercise normal precautions. Be aware of petty crime." },
  { name: "Russia", code: "RUS", flag: "🇷🇺", region: "Europe", latitude: "55.756", longitude: "37.617", overallScore: 48, crimeRate: 50, healthcareScore: 55, politicalStability: 40, naturalDisasterRisk: 55, advisoryLevel: "high_risk", travelAdvisory: "Reconsider travel due to armed conflict and harassment." },
  { name: "Saudi Arabia", code: "SAU", flag: "🇸🇦", region: "Middle East & Africa", latitude: "24.713", longitude: "46.675", overallScore: 72, crimeRate: 80, healthcareScore: 70, politicalStability: 70, naturalDisasterRisk: 50, advisoryLevel: "moderate", travelAdvisory: "Exercise increased caution due to terrorism and missile attacks." },
  { name: "Singapore", code: "SGP", flag: "🇸🇬", region: "Asia Pacific", latitude: "1.352", longitude: "103.820", overallScore: 96, crimeRate: 95, healthcareScore: 95, politicalStability: 95, naturalDisasterRisk: 50, advisoryLevel: "safe", travelAdvisory: "Exercise normal precautions. One of the safest countries in the world." },
  { name: "South Africa", code: "ZAF", flag: "🇿🇦", region: "Middle East & Africa", latitude: "-25.747", longitude: "28.229", overallScore: 50, crimeRate: 35, healthcareScore: 55, politicalStability: 60, naturalDisasterRisk: 55, advisoryLevel: "high_risk", travelAdvisory: "Exercise increased caution due to high crime rate." },
  { name: "South Korea", code: "KOR", flag: "🇰🇷", region: "Asia Pacific", latitude: "37.567", longitude: "126.978", overallScore: 90, crimeRate: 90, healthcareScore: 92, politicalStability: 85, naturalDisasterRisk: 50, advisoryLevel: "safe", travelAdvisory: "Exercise normal precautions. Very safe destination." },
  { name: "Spain", code: "ESP", flag: "🇪🇸", region: "Europe", latitude: "40.417", longitude: "-3.704", overallScore: 88, crimeRate: 78, healthcareScore: 90, politicalStability: 80, naturalDisasterRisk: 55, advisoryLevel: "safe", travelAdvisory: "Exercise normal precautions. Be aware of petty crime in tourist areas." },
  { name: "Sri Lanka", code: "LKA", flag: "🇱🇰", region: "Asia Pacific", latitude: "6.927", longitude: "79.861", overallScore: 65, crimeRate: 65, healthcareScore: 55, politicalStability: 55, naturalDisasterRisk: 50, advisoryLevel: "moderate", travelAdvisory: "Exercise increased caution due to economic crisis effects." },
  { name: "Sweden", code: "SWE", flag: "🇸🇪", region: "Europe", latitude: "59.329", longitude: "18.069", overallScore: 93, crimeRate: 82, healthcareScore: 95, politicalStability: 90, naturalDisasterRisk: 55, advisoryLevel: "safe", travelAdvisory: "Exercise normal precautions. Very safe destination." },
  { name: "Switzerland", code: "CHE", flag: "🇨🇭", region: "Europe", latitude: "46.948", longitude: "7.447", overallScore: 97, crimeRate: 92, healthcareScore: 97, politicalStability: 95, naturalDisasterRisk: 55, advisoryLevel: "safe", travelAdvisory: "Exercise normal precautions. One of the safest countries." },
  { name: "Thailand", code: "THA", flag: "🇹🇭", region: "Asia Pacific", latitude: "13.756", longitude: "100.502", overallScore: 72, crimeRate: 65, healthcareScore: 68, politicalStability: 70, naturalDisasterRisk: 55, advisoryLevel: "moderate", travelAdvisory: "Exercise normal precautions. Be aware of scams and petty crime." },
  { name: "Turkey", code: "TUR", flag: "🇹🇷", region: "Middle East & Africa", latitude: "39.933", longitude: "32.860", overallScore: 62, crimeRate: 60, healthcareScore: 65, politicalStability: 55, naturalDisasterRisk: 50, advisoryLevel: "moderate", travelAdvisory: "Exercise increased caution due to terrorism. Avoid border areas." },
  { name: "Ukraine", code: "UKR", flag: "🇺🇦", region: "Europe", latitude: "50.450", longitude: "30.524", overallScore: 30, crimeRate: 40, healthcareScore: 45, politicalStability: 25, naturalDisasterRisk: 55, advisoryLevel: "critical", travelAdvisory: "Do not travel due to armed conflict and bombings." },
  { name: "United Arab Emirates", code: "ARE", flag: "🇦🇪", region: "Middle East & Africa", latitude: "24.453", longitude: "54.377", overallScore: 92, crimeRate: 92, healthcareScore: 88, politicalStability: 90, naturalDisasterRisk: 50, advisoryLevel: "safe", travelAdvisory: "Exercise normal precautions. Very low crime rate." },
  { name: "United Kingdom", code: "GBR", flag: "🇬🇧", region: "Europe", latitude: "51.507", longitude: "-0.128", overallScore: 88, crimeRate: 78, healthcareScore: 90, politicalStability: 85, naturalDisasterRisk: 60, advisoryLevel: "safe", travelAdvisory: "Exercise normal precautions. Be aware of petty crime in major cities." },
  { name: "United States", code: "USA", flag: "🇺🇸", region: "Americas", latitude: "38.907", longitude: "-77.037", overallScore: 82, crimeRate: 65, healthcareScore: 85, politicalStability: 80, naturalDisasterRisk: 60, advisoryLevel: "safe", travelAdvisory: "Exercise normal precautions. Be aware of gun violence in certain areas." },
  { name: "Vietnam", code: "VNM", flag: "🇻🇳", region: "Asia Pacific", latitude: "21.029", longitude: "105.854", overallScore: 70, crimeRate: 70, healthcareScore: 55, politicalStability: 75, naturalDisasterRisk: 50, advisoryLevel: "moderate", travelAdvisory: "Exercise normal precautions. Be aware of petty crime and scams." },
  { name: "Ecuador", code: "ECU", flag: "🇪🇨", region: "Americas", latitude: "-0.181", longitude: "-78.468", overallScore: 62, crimeRate: 52, healthcareScore: 58, politicalStability: 58, naturalDisasterRisk: 58, advisoryLevel: "moderate", travelAdvisory: "Exercise increased caution due to crime and civil unrest." },
  { name: "Nepal", code: "NPL", flag: "🇳🇵", region: "Asia Pacific", latitude: "27.717", longitude: "85.324", overallScore: 60, crimeRate: 62, healthcareScore: 42, politicalStability: 60, naturalDisasterRisk: 52, advisoryLevel: "moderate", travelAdvisory: "Exercise increased caution due to natural disasters and limited healthcare." },
  { name: "Cuba", code: "CUB", flag: "🇨🇺", region: "Americas", latitude: "23.114", longitude: "-82.367", overallScore: 65, crimeRate: 68, healthcareScore: 72, politicalStability: 55, naturalDisasterRisk: 62, advisoryLevel: "moderate", travelAdvisory: "Exercise increased caution due to economic conditions and limited infrastructure." },
  { name: "Tunisia", code: "TUN", flag: "🇹🇳", region: "Middle East & Africa", latitude: "36.807", longitude: "10.181", overallScore: 58, crimeRate: 58, healthcareScore: 55, politicalStability: 55, naturalDisasterRisk: 50, advisoryLevel: "moderate", travelAdvisory: "Exercise increased caution due to terrorism in border areas." },
  { name: "Uruguay", code: "URY", flag: "🇺🇾", region: "Americas", latitude: "-34.901", longitude: "-56.165", overallScore: 82, crimeRate: 78, healthcareScore: 78, politicalStability: 82, naturalDisasterRisk: 52, advisoryLevel: "safe", travelAdvisory: "Exercise normal precautions. Generally safe destination." },
  { name: "Ghana", code: "GHA", flag: "🇬🇭", region: "Middle East & Africa", latitude: "5.603", longitude: "-0.187", overallScore: 60, crimeRate: 52, healthcareScore: 42, politicalStability: 68, naturalDisasterRisk: 55, advisoryLevel: "moderate", travelAdvisory: "Exercise increased caution due to petty crime. Generally stable politically." },
  { name: "Tanzania", code: "TZA", flag: "🇹🇿", region: "Middle East & Africa", latitude: "-6.792", longitude: "39.208", overallScore: 55, crimeRate: 48, healthcareScore: 38, politicalStability: 65, naturalDisasterRisk: 55, advisoryLevel: "moderate", travelAdvisory: "Exercise increased caution due to crime and limited healthcare." },
];

const ALERTS_DATA: {
  countryCode: string;
  title: string;
  description: string;
  severity: "info" | "warning" | "critical";
  alertType: string;
}[] = [
  { countryCode: "UKR", title: "Armed Conflict - Do Not Travel", description: "Active military conflict with Russia. Civilian areas are being targeted. Avoid all travel.", severity: "critical", alertType: "conflict" },
  { countryCode: "AFG", title: "Extreme Security Risk", description: "Ongoing insurgency, kidnapping risk, and limited rule of law. Foreign nationals face extreme danger.", severity: "critical", alertType: "security" },
  { countryCode: "RUS", title: "Sanctions and Restrictions", description: "International sanctions in effect. Flight restrictions apply. Risk of arbitrary detention for foreign nationals.", severity: "warning", alertType: "sanctions" },
  { countryCode: "ISR", title: "Active Conflict Zone", description: "Ongoing military operations. Rocket attacks from Gaza continue. Check local guidance before travel.", severity: "critical", alertType: "conflict" },
  { countryCode: "NGA", title: "High Crime and Kidnapping Risk", description: "Widespread violent crime, armed robbery, and kidnapping for ransom in northern regions.", severity: "warning", alertType: "crime" },
  { countryCode: "PAK", title: "Terrorism and Sectarian Violence", description: "Active terrorist groups operating in border regions. Sectarian violence in urban centers.", severity: "warning", alertType: "terrorism" },
  { countryCode: "MEX", title: "Cartel Violence in Border States", description: "Drug cartel activity concentrated in northern border states. Tourist areas generally safer but remain vigilant.", severity: "warning", alertType: "crime" },
  { countryCode: "ZAF", title: "High Crime Rate", description: "South Africa has one of the world's highest crime rates. Avoid walking alone at night and displaying valuables.", severity: "warning", alertType: "crime" },
  { countryCode: "EGY", title: "Terrorism Risk in Sinai", description: "Terrorist attacks possible, especially in the Sinai Peninsula. Tourist sites have enhanced security.", severity: "warning", alertType: "terrorism" },
  { countryCode: "TUR", title: "Earthquake Risk - Stay Informed", description: "Turkey is in an active seismic zone. Be aware of earthquake safety procedures. Recent major earthquake affected infrastructure.", severity: "info", alertType: "natural" },
  { countryCode: "IDN", title: "Volcanic Activity Alert", description: "Multiple active volcanoes. Bali's Mount Agung shows increased activity. Check volcanic alerts before travel.", severity: "info", alertType: "natural" },
  { countryCode: "PHL", title: "Typhoon Season Advisory", description: "Typhoon season runs June to November. Monitor weather forecasts closely. Infrastructure damage possible.", severity: "info", alertType: "natural" },
  { countryCode: "BRA", title: "Urban Crime Advisory", description: "High levels of violent crime in major cities. Favelas should be avoided entirely. Use registered taxis only.", severity: "warning", alertType: "crime" },
  { countryCode: "KEN", title: "Wildlife Park Safety", description: "National parks are generally safe but follow guide instructions. Avoid areas near Somalia border due to terrorism risk.", severity: "info", alertType: "security" },
  { countryCode: "COL", title: "Peace Process Progress", description: "Security situation improving following peace agreement. Some remote areas still have armed group presence.", severity: "info", alertType: "security" },
];

async function seed() {
  const db = getDb();

  console.log("Seeding countries...");
  for (const country of COUNTRIES_DATA) {
    await db.insert(countries).values(country).onDuplicateKeyUpdate({
      set: country,
    });
  }
  console.log(`Seeded ${COUNTRIES_DATA.length} countries.`);

  console.log("Seeding safety alerts...");
  const allCountries = await db.select().from(countries);
  const countryMap = new Map(allCountries.map((c) => [c.code, c.id]));

  for (const alert of ALERTS_DATA) {
    const countryId = countryMap.get(alert.countryCode);
    if (countryId) {
      await db
        .insert(safetyAlerts)
        .values({
          countryId,
          title: alert.title,
          description: alert.description,
          severity: alert.severity,
          alertType: alert.alertType,
          effectiveDate: new Date(),
        } as any)
        .onDuplicateKeyUpdate({
          set: {
            title: alert.title,
            description: alert.description,
            severity: alert.severity,
            alertType: alert.alertType,
          },
        });
    }
  }
  console.log(`Seeded ${ALERTS_DATA.length} safety alerts.`);

  console.log("Seed complete!");
}

seed().catch(console.error);
