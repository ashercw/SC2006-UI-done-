export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    return false;
  }

  let permission = Notification.permission;

  if (permission === "default") {
    permission = await Notification.requestPermission();
  }

  return permission === "granted";
};

export const scheduleNotification = (title, options = {}, delay = 0) => {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  setTimeout(() => {
    new Notification(title, {
      icon: '/fitnessApp_logo.png',
      ...options
    });
  }, delay);
};

export const createWorkoutReminder = () => {
  scheduleNotification(
    "Time to Work Out!",
    {
      body: "Don't forget your daily workout routine.",
      badge: '/fitnessApp_logo.png'
    }
  );
};

export const createMealReminder = () => {
  scheduleNotification(
    "Meal Time!",
    {
      body: "Time to log your meal and track your nutrition.",
      badge: '/fitnessApp_logo.png'
    }
  );
};

export const createProgressUpdate = (achievement) => {
  scheduleNotification(
    "Progress Update!",
    {
      body: `Congratulations! ${achievement}`,
      badge: '/fitnessApp_logo.png'
    }
  );
};
