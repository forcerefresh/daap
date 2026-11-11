export function getLicenseNameByType(type: string) {
  switch (type) {
    case "onedeveloper": {
      return "One Developer";
    }
    case "team": {
      return "Team";
    }
    case "largeteam": {
      return "Large Team";
    }
    default:
      return "";
  }
}

export function getSubscriptionNameByType(type: string) {
  switch (type) {
    case "monthly": {
      return "Monthly";
    }
    case "yearly": {
      return "Yearly";
    }
    case "nosubscription": {
      return "No Subscription - All services are available for trial period of 15 days";
    }
    default:
      return "";
  }
}
