export default {
  schema: "./db.js", 
  out: "./drizzle",         
  dialect: "sqlite",
  dbCredentials: {
    url: "./linknest.sqlite" 
  },
};
