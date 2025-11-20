import {getBuildConstant} from "../constants/build-constants.jsx";
import moment from "moment";

export const getAPIBaseURL = () => {
  const host = getBuildConstant('REACT_APP_API_HOST');
  const protocol = getBuildConstant('REACT_APP_API_PROTOCOL');
  return `${protocol}://${host}`;
};

export const formatDateIfDate = (dateObj) => {
  if (dateObj instanceof Date) {
    return moment(dateObj).format('YYYY-MM-DD')
  }
  // If it's not a Date object, return the original value
  return dateObj;
}

export const isNotEmptyObj = (value) =>
  value !== undefined && value !== null && Object.keys(value).length !== 0;

export const getInitials = (name) => {
  return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('');
}

export const getFirstName = (name) => {
  return name.split(' ')[0];
};

export const getSelectOptions = (options) => {
  if (options && options.length) {
    return options.map(o => ({
      value: o?.id 
        ? String(o?.id) 
        : o?.rID 
        ? String(o?.rID) 
        : String(o?.checklistID),
      label: o?.name || o?.value || o?.summary
    }));
  } else {
    return [];
  }
};


export const getUserSelectOptions = (options) => {
  return options.map(o => ({value: Number(o.id), label: `${o.firstName} ${o.lastName}`}));
};

export const getUserOptions = (options) => {
  const uniqueObjects = new Map();

  options.forEach((o) => {
    const id = Number(o.id);
    if (!uniqueObjects.has(id)) {
      uniqueObjects.set(id, {
        id,
        name: `${o.firstName} ${o.lastName}`,
        initials: `${o.firstName[0]}${o.lastName[0]}`.toUpperCase(),
      });
    }
  });

  return Array.from(uniqueObjects.values());
};

export const getMultiSelectOptions = (options, ids) => {
  return options.filter(item => ids.includes(item.value));
};

export const formatShortDate = (dateString) => {
  if (dateString) {
    const date = new Date(dateString);
    const options = {month: 'short', day: 'numeric'};
    return date.toLocaleDateString('en-US', options);
  } else {
    return "N/A"
  }
}

export const getSpendTime = (timeEntries) => {
  const totalHours = timeEntries.reduce((sum, entry) => sum + entry.time, 0);

  const hoursInWeek = 168;
  const hoursInDay = 24;
  const hoursInMonth = 30.44 * hoursInDay;
  const minutesInHour = 60;

  const months = Math.floor(totalHours / hoursInMonth);
  const remainingHoursAfterMonths = totalHours % hoursInMonth;

  const weeks = Math.floor(remainingHoursAfterMonths / hoursInWeek);
  const remainingHoursAfterWeeks = remainingHoursAfterMonths % hoursInWeek;

  const days = Math.floor(remainingHoursAfterWeeks / hoursInDay);
  const remainingHoursAfterDays = remainingHoursAfterWeeks % hoursInDay;

  const hours = Math.floor(remainingHoursAfterDays);
  const minutes = Math.round((remainingHoursAfterDays - hours) * minutesInHour);

  let result = '';
  if (months > 0) result += `${months}mo `;
  if (weeks > 0) result += `${weeks}w `;
  if (days > 0) result += `${days}d `;
  if (hours > 0) result += `${hours}h `;
  if (minutes > 0) result += `${minutes}m`;

  return result.trim();
};

export const isValidEstimationFormat = (inputString) => {
  const spendTimeRegex = /^(?:(\d+)mo\s*)?(?:(\d+)w\s*)?(?:(\d+)d\s*)?(?:(\d+)h\s*)?(?:(\d+)m\s*)?$/;
  return spendTimeRegex.test(inputString.trim());
};

export const calculateRemainingTime = (estimation, spent) => {
  const timeUnits = {mo: 30.44 * 24, w: 7 * 24, d: 24, h: 1, m: 1 / 60};

  const parseTime = (timeString) => {
    const regex = /(\d+)(mo|w|d|h|m)/g;
    let totalHours = 0;
    let match;

    while ((match = regex.exec(timeString)) !== null) {
      const value = parseInt(match[1], 10);
      const unit = match[2];
      totalHours += value * timeUnits[unit];
    }

    return totalHours;
  };

  const formatTime = (hours) => {
    const months = Math.floor(hours / timeUnits.mo);
    hours %= timeUnits.mo;

    const weeks = Math.floor(hours / timeUnits.w);
    hours %= timeUnits.w;

    const days = Math.floor(hours / timeUnits.d);
    hours %= timeUnits.d;

    const hrs = Math.floor(hours);
    const minutes = Math.round((hours - hrs) * 60);

    let result = '';
    if (months > 0) result += `${months}mo `;
    if (weeks > 0) result += `${weeks}w `;
    if (days > 0) result += `${days}d `;
    if (hrs > 0) result += `${hrs}h `;
    if (minutes > 0) result += `${minutes}m`;

    return result.trim();
  };

  const estimationHours = parseTime(estimation);
  const spentHours = parseTime(spent);

  if (spentHours === estimationHours) {
    return {
      status: "within",
      time: "0",
      percentage: 100,
    };
  }

  const percentage = ((spentHours / estimationHours) * 100).toFixed(2);

  if (spentHours > estimationHours) {
    const overtime = spentHours - estimationHours;
    return {
      status: "over",
      time: formatTime(overtime),
      percentage: 100,
    };
  }

  const remainingHours = estimationHours - spentHours;

  return {
    status: "within",
    time: formatTime(remainingHours),
    percentage: percentage,
  };
};

export const getRelativeDate = (dateString) => {
  const inputDate = moment(dateString);

  if (!inputDate.isValid()) {
    return 'Invalid date';
  }

  const now = moment();
  const daysDifference = now.diff(inputDate, 'days');

  if (daysDifference === 0) {
    return 'Today';
  } else if (daysDifference === 1) {
    return '1 day ago';
  } else {
    return `${daysDifference} days ago`;
  }
}

