export type ResumeDocument = {
  contact: { fullName: string; email: string; phone: string; location: string; headline: string; links: { label: string; url: string }[] };
  professionalSummary: string;
  skills: string[];
  experience: { company: string; role: string; startDate: string; endDate: string; bullets: string[] }[];
  education: { institution: string; degree: string; startDate: string; endDate: string; details: string }[];
  certifications: string[];
};

export type CoverLetterDocument = {
  recipient: string;
  subject: string;
  greeting: string;
  paragraphs: string[];
  closing: string;
  signature: string;
};
