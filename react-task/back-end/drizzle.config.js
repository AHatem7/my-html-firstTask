export default {
  schema: "./src/db/schema.js",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "./src/db/habitforge.sqlite",
  },
};
