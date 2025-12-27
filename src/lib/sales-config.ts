// Sales/Deals Demo Configuration
// This configuration is used to customize the Decision Memory app for sales teams

export const DECISION_TYPE_LABEL = 'Deal Approval';
export const DECISION_TYPE_PLURAL = 'Deal Approvals';

export const CONTEXT_TAGS = [
  // Deal Size
  'Small Deal (<$10K)',
  'Medium Deal ($10K-$50K)',
  'Large Deal ($50K-$250K)',
  'Enterprise Deal ($250K+)',
  
  // Customer Segment
  'New Customer',
  'Existing Customer',
  'Strategic Account',
  'Partner Referral',
  
  // Discount Tier
  'Standard Pricing',
  'Small Discount (5-10%)',
  'Medium Discount (10-20%)',
  'Large Discount (20%+)',
  'Custom Terms',
  
  // Contract Type
  'Monthly',
  'Annual',
  'Multi-Year',
  'Trial/POC',
  'Enterprise Agreement',
  
  // Deal Stage
  'Early Stage',
  'Mid-Funnel',
  'Late Stage',
  'Closed Won',
  'Closed Lost',
];

export const FIELD_LABELS = {
  title: 'Deal Name',
  summary: 'Deal Summary',
  contextTags: 'Deal Categories',
  constraints: 'Deal Constraints',
  optionsConsidered: 'Pricing Options Considered',
  selectedOption: 'Selected Pricing/Terms',
  reasoning: 'Approval Rationale',
  risksAssumptions: 'Deal Risks & Assumptions',
  confidenceLevel: 'Win Probability Assessment',
  decisionOwner: 'Sales Rep',
  approvers: 'Approvers',
  estimatedImpact: 'Deal Value',
  outcome: 'Actual Outcome',
};

export const FIELD_PLACEHOLDERS = {
  title: 'e.g., Acme Corp Enterprise License Renewal',
  summary: 'Describe the deal, customer needs, and key context...',
  constraints: 'e.g., Customer budget is fixed at $45K, competitor offering 30% discount...',
  optionLabel: 'e.g., Standard 3-year enterprise license',
  optionDescription: 'Describe this pricing/terms option and its pros/cons...',
  selectedOption: 'Which pricing or terms option was selected?',
  reasoning: 'Why was this pricing/terms decision made? What factors were most important?',
  risksAssumptions: 'What risks exist with this deal? What assumptions are we making about the customer or market?',
  outcome: 'What was the actual result of this deal? (Fill in after deal closes)',
  impactLabel: 'e.g., Annual contract value, Total contract value',
};

export const CONFIDENCE_LABELS = {
  1: 'Very Low (<20% probability)',
  2: 'Low (20-40% probability)',
  3: 'Medium (40-60% probability)',
  4: 'High (60-80% probability)',
  5: 'Very High (80%+ probability)',
};