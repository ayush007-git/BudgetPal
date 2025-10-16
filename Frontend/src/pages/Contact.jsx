import React from "react";
import "../styles/Contact.css";

const Contact = () => {
  return (
    <section id="contact" className="contact-section">
      <div className="contact-container">
        <div className="contact-header">
          <h2>Contact Us</h2>
          <p>Have questions? We'd love to hear from you.</p>
        </div>

        <form className="contact-form">
          <div className="form-group">
            <input type="text" id="name" required />
            <label htmlFor="name">Your Name</label>
          </div>

          <div className="form-group">
            <input type="email" id="email" required />
            <label htmlFor="email">Your Email</label>
          </div>

          <div className="form-group">
            <textarea id="message" required></textarea>
            <label htmlFor="message">Your Message</label>
          </div>

          <button type="submit" className="contact-btn">Send Message</button>
        </form>
      </div>
    </section>
  );
};

export default Contact;
