import { Router } from "express";
import * as artists from "../controllers/artists.js";
import * as auth from "../controllers/auth.js";
import * as blogPosts from "../controllers/blogPosts.js";
import * as blogTopics from "../controllers/blogTopics.js";
import * as course from "../controllers/course.js";
import * as faqs from "../controllers/faqs.js";
import * as piercings from "../controllers/piercings.js";
import * as piercingZones from "../controllers/piercingZones.js";
import * as styles from "../controllers/styles.js";
import * as tattoos from "../controllers/tattoos.js";
import { limitLogins, requireAdmin } from "../middleware/auth.js";
import { photoUpload } from "../middleware/upload.js";

/**
 * Every API route. Reading is open to everyone (the site shows this data);
 * anything that changes data needs an admin session.
 */
const api = Router();

api.post("/auth/login", limitLogins, auth.login);
api.post("/auth/logout", auth.logout);
api.get("/auth/me", auth.me);

api.get("/styles", styles.listStyles);
api.post("/styles", requireAdmin, styles.createStyle);
api.patch("/styles/:id", requireAdmin, styles.updateStyle);
api.delete("/styles/:id", requireAdmin, styles.deleteStyle);

// `:key` is an artist's id or the slug from their profile's address
api.get("/artists", artists.listArtists);
api.get("/artists/:key", artists.getArtist);
api.post("/artists", requireAdmin, photoUpload, artists.createArtist);
api.patch("/artists/:key", requireAdmin, photoUpload, artists.updateArtist);
api.delete("/artists/:key", requireAdmin, artists.deleteArtist);

api.get("/tattoos", tattoos.listTattoos);
api.post("/tattoos", requireAdmin, photoUpload, tattoos.createTattoo);
api.patch("/tattoos/:id", requireAdmin, photoUpload, tattoos.updateTattoo);
api.delete("/tattoos/:id", requireAdmin, tattoos.deleteTattoo);

// the piercing price list: zones, and the places (with prices) inside each
api.get("/piercing/zones", piercingZones.listZones);
api.post("/piercing/zones", requireAdmin, piercingZones.createZone);
api.patch("/piercing/zones/:id", requireAdmin, piercingZones.updateZone);
api.delete("/piercing/zones/:id", requireAdmin, piercingZones.deleteZone);
api.post("/piercing/zones/:id/places", requireAdmin, piercingZones.createPlace);
api.patch("/piercing/places/:id", requireAdmin, piercingZones.updatePlace);
api.delete("/piercing/places/:id", requireAdmin, piercingZones.deletePlace);

// photos of piercings done at the studio
api.get("/piercings", piercings.listPiercings);
api.post("/piercings", requireAdmin, photoUpload, piercings.createPiercing);
api.patch("/piercings/:id", requireAdmin, photoUpload, piercings.updatePiercing);
api.delete("/piercings/:id", requireAdmin, piercings.deletePiercing);

// the blog: topics, and the articles filed under them.
// `:key` is an article's id or the slug from its address
api.get("/blog/topics", blogTopics.listTopics);
api.post("/blog/topics", requireAdmin, blogTopics.createTopic);
api.patch("/blog/topics/:id", requireAdmin, blogTopics.updateTopic);
api.delete("/blog/topics/:id", requireAdmin, blogTopics.deleteTopic);
api.get("/blog/posts", blogPosts.listPosts);
api.get("/blog/posts/:key", blogPosts.getPost);
api.post("/blog/posts", requireAdmin, photoUpload, blogPosts.createPost);
api.patch("/blog/posts/:key", requireAdmin, photoUpload, blogPosts.updatePost);
api.delete("/blog/posts/:key", requireAdmin, blogPosts.deletePost);

// the tattoo course: one record at most, shown on the site's /course page.
// Its title and text are saved as JSON; its photos are added one at a time.
api.get("/course", course.getCourse);
api.put("/course", requireAdmin, course.saveCourse);
api.post("/course/photos", requireAdmin, photoUpload, course.addPhoto);
api.delete("/course", requireAdmin, course.deleteCourse);

// the home page's frequently asked questions, in the order the admin panel gives them
api.get("/faqs", faqs.listFaqs);
api.post("/faqs", requireAdmin, faqs.createFaq);
api.put("/faqs/order", requireAdmin, faqs.orderFaqs);
api.patch("/faqs/:id", requireAdmin, faqs.updateFaq);
api.delete("/faqs/:id", requireAdmin, faqs.deleteFaq);

export default api;
