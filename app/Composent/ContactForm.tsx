"use client";

import { useState, type FormEvent } from "react";

export default function ContactForm() {
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
    event.currentTarget.reset();
  }

  return (
    <form className="d-flex gap-3 flex-column" onSubmit={handleSubmit}>
      <h3 className="fw-bold text-start display-6">Have a project in mind ?</h3>
      <p className="text-start text-body-secondary">
        Tell us about your project and we will get back to you shortly.
      </p>

      <div className="d-flex flex-column flex-sm-row gap-3">
        <div className="flex-fill">
          <label htmlFor="contact-full-name" className="visually-hidden">
            Full Name
          </label>
          <input
            type="text"
            className="form-control border-1 border-dark"
            name="full-name"
            id="contact-full-name"
            placeholder="Full Name"
            autoComplete="name"
            required
          />
        </div>
        <div className="flex-fill">
          <label htmlFor="contact-email" className="visually-hidden">
            Email
          </label>
          <input
            type="email"
            className="form-control border-1 border-dark"
            name="email"
            id="contact-email"
            placeholder="Email"
            autoComplete="email"
            required
          />
        </div>
      </div>

      <label htmlFor="contact-subject" className="visually-hidden">
        Subject
      </label>
      <input
        type="text"
        className="form-control border-1 border-dark"
        name="subject"
        id="contact-subject"
        placeholder="Subject"
        required
      />

      <label htmlFor="contact-message" className="visually-hidden">
        Message
      </label>
      <textarea
        className="form-control border-1 border-dark"
        name="message"
        id="contact-message"
        placeholder="Message"
        rows={4}
        required
      />

      <div>
        <button type="submit" className="btn btn-dark px-4">
          Send
        </button>
      </div>
      {sent && (
        <p className="text-start mb-0" role="status">
          Merci, votre message a bien été pris en compte.
        </p>
      )}
    </form>
  );
}
