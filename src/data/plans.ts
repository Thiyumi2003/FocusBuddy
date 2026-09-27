export const personalPlans = [
{
  id: 'free',
  name: 'Free',
  tagline: 'A friendly reminder app',
  price: '$0',
  unit: 'forever',
  highlights: ['Basic reminders', 'Natural-language input', 'Basic stars & badges'],
  tone: 'bg-mint-soft text-mint-ink'
},
{
  id: 'premium',
  name: 'Personal Premium',
  tagline: 'Your AI reminder companion',
  price: '$6',
  unit: 'per month',
  highlights: ['Smart reminder timing', 'Focus-safe notifications', 'AI Insights'],
  tone: 'bg-lavender-soft text-lavender-ink'
},
{
  id: 'student',
  name: 'Student Premium',
  tagline: 'All of Premium for verified students',
  price: '$2.50',
  unit: 'per month',
  highlights: ['Everything in Premium', 'Over 55% off', 'Email or student ID'],
  tone: 'bg-pink-soft text-pink-ink'
}];


export const comparisonRows: {feature: string;free: boolean | string;premium: boolean | string;student: boolean | string;}[] = [
{ feature: 'High / Medium / Low reminders', free: true, premium: true, student: true },
{ feature: 'Natural-language text & voice input', free: true, premium: true, student: true },
{ feature: 'Stars & achievement badges', free: 'Basic', premium: 'All', student: 'All' },
{ feature: 'AI behaviour learning', free: false, premium: true, student: true },
{ feature: 'Smart reminder timing', free: false, premium: true, student: true },
{ feature: 'Focus-safe notifications', free: false, premium: true, student: true },
{ feature: 'Smart AI rescheduling', free: false, premium: true, student: true },
{ feature: 'Calendar & workload awareness', free: false, premium: true, student: true },
{ feature: 'AI Insights', free: false, premium: true, student: true },
{ feature: 'Advanced personalisation', free: false, premium: true, student: true }];


export const teamRatePerMember = 4;
