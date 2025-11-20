/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-pink': '#EB5A84',
        'project-name-content-pages-color': '#232633',
        'secondary-pink': '#fdd6db',
        'secondary-text-color': ' RGB(88, 88, 88)',
        'text-color': 'rgba(116, 122, 136, 1)',
        'card-white': '#FFFFFF',
        'cancel-button':"rgba(116, 122, 136, 1)",
        'priority-button-high':"rgba(219, 93, 93, 1)",
        'priority-button-medium':"rgba(201, 246, 191, 1)",
        'priority-button-low': "rgba(251, 242, 173, 1)",
        'user-invite-button' : "rgba(65, 169, 54, 1);",
        'dashboard-bgc': '#f4f5fb',
        'secondary-grey': '#747A88',
        'dark-white': '#fbfbfb',
        'in-progress': '#cafafa',
        'secondary-bgc': '#E8E8E85C',
        'status-todo': '#C9232F',
        'status-in-progress': '#E4AF00',
        'status-done': '#7DB67F',
        'create-button': 'rgba(235, 90, 132, 1)',
        'priority-high': '#DB5D5D',
        'priority-medium': '#FCE570',
        'priority-low': '#C9F6BF',
        'task-status-to-do': "#FDED99",
        'task-status-to-do-bold': "#E4AF00",
        'task-status-in-progress': "#CAFAFA",
        'task-status-in-progress-bold': "#42C4D2",
        'task-status-qa': "#EBC0FF",
        'task-status-qa-bold': "#BF65F5",
        'task-status-uat': "#FDD190",
        'task-status-uat-bold': "#FF9820",
        'task-status-done': "#C9F6BF",
        'task-status-done-bold': "#41A936",
        'light-red': "#FFE1E1",
        'popup-screen-header' : '#585858',
        'count-notification' : '#E6E6E6',
        'user-detail-box' : 'F4F5FB',
        'border-color' : 'E6E6E6',

      },
      height: {
        'list-screen': 'calc(100vh - 183px)',
        'content-screen': 'calc(100vh - 90px)',
        'task-list-screen': 'calc(100vh - 310px)',
        '21-5-px': '21.5px'
      },
      translate: {
        '4.2': '1.1rem',
      },
      spacing: {
        '2px': '2px',
        '3px': '3px',
        '25px': '25px',
      },
      screens:{
        laptopL:{max:"1580px"}
      }
      
    },
  },
  plugins: [],
}
