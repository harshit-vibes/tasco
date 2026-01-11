/**
 * Seed Legal Framework Documents
 *
 * This script creates mock law-of-the-land documents in S3 for the Legal Framework page.
 * These documents have category='_LEGAL' and are shown in the Legal Framework tab.
 *
 * Usage: bun run scripts/seed-legal-docs.ts
 */

import {
  getDocumentsIndex,
  updateDocumentsIndex,
  putDocument,
  type DocumentMetadata,
  type LegalDocumentType,
} from "@tasco/db/s3";
import { DOCUMENT_CATEGORIES } from "@tasco/agents/knowledge-bases";

// Get legal category from central registry
const LEGAL_CATEGORY = DOCUMENT_CATEGORIES._LEGAL?.key || "_LEGAL";

// Generate a document ID from the name
function generateDocId(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const timestamp = Date.now().toString(36);
  return `${slug}-${timestamp}`;
}

// Sanitize filename
function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Mock legal documents content
const LEGAL_DOCUMENTS: Array<{
  name: string;
  legalType: LegalDocumentType;
  jurisdiction: string;
  summary: string;
  tags: string[];
  enactmentDate: string;
  content: string;
}> = [
  {
    name: "Enterprise Law No. 59/2020/QH14",
    legalType: "law",
    jurisdiction: "Vietnam",
    summary:
      "Vietnamese Enterprise Law governing the establishment, organization, restructuring, dissolution and relevant activities of enterprises in Vietnam.",
    tags: ["enterprise", "corporate", "governance", "formation"],
    enactmentDate: "2020-06-17",
    content: `# Enterprise Law No. 59/2020/QH14

## NATIONAL ASSEMBLY
## LAW ON ENTERPRISES

Pursuant to the Constitution of the Socialist Republic of Vietnam;
The National Assembly promulgates the Law on Enterprises.

## Chapter I: GENERAL PROVISIONS

### Article 1. Scope of regulation
This Law prescribes the establishment, organization, restructuring, dissolution and relevant activities of enterprises; rights and obligations of enterprises.

### Article 2. Regulated entities
1. Enterprises established and operating under this Law.
2. Organizations and individuals involved in the establishment, organization, restructuring, dissolution and relevant activities of enterprises.

### Article 3. Application of the Law on Enterprises, related laws and treaties
1. The establishment, organization, management and operations of enterprises of all economic sectors shall comply with this Law and other relevant laws.
2. In case where a treaty to which the Socialist Republic of Vietnam is a signatory contains provisions different from those of this Law, such treaty shall apply.

### Article 4. Interpretation of terms
In this Law, the terms below are construed as follows:
1. "Enterprise" means an organization that has its own name, assets, transaction office and is registered in accordance with law for the purpose of doing business.
2. "State enterprise" means an enterprise in which the State holds 100% of the charter capital.
3. "Establishment of an enterprise" means the registration of an enterprise with the business registration authority.

### Article 5. Guarantee of the right to do business
1. The State recognizes the long-term existence and development of types of enterprises specified in this Law; guarantees the equality of enterprises before law regardless of the form of ownership and economic sector; recognizes the lawful and legitimate profitability of business.
2. The lawful assets and investment capital of enterprises and business owners in enterprises shall be protected by law and shall not be nationalized.

### Article 6. Political organizations, socio-political organizations in enterprises
1. Political organizations, socio-political organizations in enterprises shall operate within the framework of the Constitution, laws and their charters.
2. Enterprises are responsible for respecting and facilitating the establishment and operation of political organizations and socio-political organizations.

## Chapter II: ESTABLISHMENT OF ENTERPRISES AND BUSINESS REGISTRATION

### Article 7. Right to establish and manage enterprises
1. Organizations and individuals have the right to establish and manage enterprises in Vietnam in accordance with this Law.

### Article 8. Procedures for enterprise registration
1. Business registration procedures shall be conducted at the business registration authority.
2. Business registration authorities shall complete registration within 3 working days from the receipt of a valid application.

---

*This is a sample/mock document for demonstration purposes only.*
`,
  },
  {
    name: "Decree 47/2021/ND-CP on Corporate Governance",
    legalType: "decree",
    jurisdiction: "Vietnam",
    summary:
      "Government decree providing detailed regulations and guidelines for implementing corporate governance provisions under the Enterprise Law.",
    tags: ["governance", "corporate", "decree", "compliance"],
    enactmentDate: "2021-04-01",
    content: `# Decree No. 47/2021/ND-CP

## GOVERNMENT OF THE SOCIALIST REPUBLIC OF VIETNAM

Providing guidelines for a number of articles of the Enterprise Law regarding corporate governance

## Chapter I: GENERAL PROVISIONS

### Article 1. Scope of regulation
This Decree provides detailed guidelines for the following matters:
1. Corporate governance of joint-stock companies.
2. Rights and responsibilities of shareholders, the Board of Directors, and the Management Board.
3. Information disclosure requirements.
4. Internal audit and control procedures.

### Article 2. Subjects of application
This Decree applies to:
1. Joint-stock companies established under the Enterprise Law.
2. Members, shareholders, Board of Directors members, and Management Board members.
3. State agencies and other relevant organizations and individuals.

## Chapter II: CORPORATE GOVERNANCE PRINCIPLES

### Article 3. Basic principles
1. Transparency: Companies must disclose information in a timely and accurate manner.
2. Accountability: Board members and managers are accountable for their decisions.
3. Fairness: All shareholders shall be treated equally.
4. Responsibility: Companies must comply with all applicable laws and regulations.

### Article 4. Board of Directors responsibilities
1. The Board of Directors shall be responsible for:
   a) Developing and implementing business strategies.
   b) Establishing internal control systems.
   c) Ensuring compliance with applicable laws.
   d) Protecting shareholder interests.

### Article 5. Audit Committee
1. Listed companies and large non-listed companies must establish an Audit Committee.
2. The Audit Committee shall consist of at least 3 members, of which at least 1 member must be an independent director.
3. The Audit Committee is responsible for:
   a) Reviewing financial statements.
   b) Monitoring internal audit activities.
   c) Evaluating the effectiveness of internal controls.

## Chapter III: INFORMATION DISCLOSURE

### Article 6. Annual report requirements
1. Companies must prepare and publish an annual report within 90 days after the end of each fiscal year.
2. The annual report shall include:
   a) Business performance summary.
   b) Financial statements.
   c) Corporate governance report.
   d) Sustainability report.

---

*This is a sample/mock document for demonstration purposes only.*
`,
  },
  {
    name: "Circular 96/2021/TT-BTC on Financial Reporting",
    legalType: "circular",
    jurisdiction: "Vietnam",
    summary:
      "Ministry of Finance circular providing guidance on financial reporting standards and requirements for enterprises.",
    tags: ["finance", "reporting", "accounting", "circular"],
    enactmentDate: "2021-11-12",
    content: `# Circular No. 96/2021/TT-BTC

## MINISTRY OF FINANCE

Providing guidance on financial reporting for enterprises

## Chapter I: GENERAL PROVISIONS

### Article 1. Scope of regulation
This Circular provides guidance on:
1. Financial statement preparation and presentation.
2. Accounting standards compliance.
3. Financial reporting deadlines.
4. Audit requirements.

### Article 2. Applicable entities
This Circular applies to:
1. All enterprises established under Vietnamese law.
2. Foreign-invested enterprises in Vietnam.
3. Branches and representative offices of foreign companies.

## Chapter II: FINANCIAL STATEMENT REQUIREMENTS

### Article 3. Components of financial statements
A complete set of financial statements shall include:
1. Balance sheet (Statement of financial position).
2. Income statement (Statement of comprehensive income).
3. Cash flow statement.
4. Statement of changes in equity.
5. Notes to financial statements.

### Article 4. Preparation standards
1. Financial statements must be prepared in accordance with Vietnamese Accounting Standards (VAS).
2. Large enterprises and listed companies must also comply with International Financial Reporting Standards (IFRS) where applicable.

### Article 5. Reporting deadlines
1. Annual financial statements: Within 90 days after fiscal year-end.
2. Quarterly financial statements (for listed companies): Within 30 days after quarter-end.
3. Semi-annual financial statements: Within 45 days after the first half-year.

## Chapter III: AUDIT REQUIREMENTS

### Article 6. Mandatory audit
The following entities must have their financial statements audited:
1. All listed companies.
2. Companies with charter capital over 10 billion VND.
3. State-owned enterprises.
4. Insurance and financial companies.

### Article 7. Auditor qualifications
1. Auditors must be licensed by the Ministry of Finance.
2. Audit firms must be independent and maintain objectivity.

---

*This is a sample/mock document for demonstration purposes only.*
`,
  },
  {
    name: "Resolution 42/2017/QH14 on Bad Debt Settlement",
    legalType: "law",
    jurisdiction: "Vietnam",
    summary:
      "National Assembly resolution on pilot bad debt settlement of credit institutions, providing legal framework for NPL resolution.",
    tags: ["banking", "NPL", "credit", "debt"],
    enactmentDate: "2017-06-21",
    content: `# Resolution No. 42/2017/QH14

## NATIONAL ASSEMBLY

On piloting settlement of bad debts of credit institutions

## Chapter I: GENERAL PROVISIONS

### Article 1. Scope of regulation
This Resolution prescribes piloting the settlement of bad debts and handling of collateral for bad debts of credit institutions, foreign bank branches.

### Article 2. Definitions
1. "Bad debt" means a debt of a credit institution that:
   a) Has principal and/or interest overdue.
   b) Has been restructured with evidence of deterioration in repayment capacity.
   c) Is classified as sub-standard, doubtful, or loss.

2. "Debt sale" means the transfer of bad debts from credit institutions to debt purchasing organizations.

## Chapter II: BAD DEBT SETTLEMENT MEASURES

### Article 3. Debt restructuring
Credit institutions may restructure bad debts by:
1. Extending repayment terms.
2. Reducing interest rates.
3. Waiving part of interest or principal.
4. Converting debt to equity.

### Article 4. Collateral seizure
1. Credit institutions have the right to seize collateral when:
   a) The debt is classified as bad debt.
   b) The borrower fails to comply with the debt restructuring agreement.
   c) The collateral value is declining significantly.

### Article 5. Debt sale procedures
1. Bad debts may be sold to:
   a) Vietnam Asset Management Company (VAMC).
   b) Other licensed debt trading companies.
   c) Foreign investors meeting prescribed conditions.

## Chapter III: PROTECTION OF CREDITOR RIGHTS

### Article 6. Court procedures
1. Courts shall prioritize the settlement of disputes related to bad debt recovery.
2. Simplified procedures apply to cases with clear collateral and documentation.

---

*This is a sample/mock document for demonstration purposes only.*
`,
  },
  {
    name: "Decree 153/2020/ND-CP on Bond Issuance",
    legalType: "decree",
    jurisdiction: "Vietnam",
    summary:
      "Government decree regulating private placement and public offering of corporate bonds in the domestic market.",
    tags: ["bonds", "securities", "capital", "issuance"],
    enactmentDate: "2020-12-31",
    content: `# Decree No. 153/2020/ND-CP

## GOVERNMENT OF THE SOCIALIST REPUBLIC OF VIETNAM

On private placement and trading of corporate bonds in the domestic market and offering of corporate bonds to the international market

## Chapter I: GENERAL PROVISIONS

### Article 1. Scope of regulation
This Decree regulates:
1. Conditions for issuing corporate bonds.
2. Procedures for private placement.
3. Bond registration and trading.
4. Disclosure requirements.

### Article 2. Bond types
1. Conventional bonds: Unsecured debt instruments.
2. Convertible bonds: Bonds convertible to equity.
3. Warrant-attached bonds: Bonds with equity purchase rights.
4. Secured bonds: Bonds backed by collateral.
5. Green bonds: Bonds for environmental projects.

## Chapter II: ISSUANCE CONDITIONS

### Article 3. General conditions
Enterprises issuing bonds must:
1. Be legally established and operating.
2. Have audited financial statements for the latest year.
3. Have no overdue debt obligations (for unsecured bonds).
4. Comply with capital adequacy requirements.

### Article 4. Financial requirements
1. Minimum charter capital: VND 30 billion.
2. Positive shareholders' equity.
3. Profitable operations in the latest fiscal year (for unsecured bonds).
4. Debt-to-equity ratio not exceeding 3:1.

### Article 5. Use of proceeds
Bond proceeds must be used for:
1. Business expansion.
2. Capital structure optimization.
3. Investment projects as specified in the issuance plan.

## Chapter III: DISCLOSURE REQUIREMENTS

### Article 6. Pre-issuance disclosure
Issuers must disclose:
1. Issuance plan and terms.
2. Financial statements.
3. Business plan and use of proceeds.
4. Risk factors.

### Article 7. Ongoing disclosure
Issuers must regularly disclose:
1. Quarterly and annual financial statements.
2. Material events affecting the bonds.
3. Use of proceeds report.

---

*This is a sample/mock document for demonstration purposes only.*
`,
  },
  {
    name: "Labor Code No. 45/2019/QH14",
    legalType: "law",
    jurisdiction: "Vietnam",
    summary:
      "Vietnamese Labor Code governing labor standards, employment relationships, wages, working conditions, and labor dispute resolution.",
    tags: ["labor", "employment", "HR", "workplace"],
    enactmentDate: "2019-11-20",
    content: `# Labor Code No. 45/2019/QH14

## NATIONAL ASSEMBLY
## LABOR CODE

Pursuant to the Constitution of the Socialist Republic of Vietnam;
The National Assembly promulgates the Labor Code.

## Chapter I: GENERAL PROVISIONS

### Article 1. Scope of regulation
This Code regulates labor standards, rights and obligations of employees, employers; labor management; employment; vocational training; working time; rest time; occupational safety; labor discipline; material liability; labor for certain types of employees.

### Article 2. Subjects of application
1. Employees, trainees, apprentices.
2. Employers.
3. Other relevant organizations and individuals.

### Article 3. Key terms
1. "Employee" means a person who works for an employer under an agreement.
2. "Employer" means an enterprise, agency, or individual that employs workers.
3. "Labor contract" means a written agreement on paid employment.

## Chapter II: EMPLOYMENT

### Article 4. Employment policies
1. The State shall create conditions for employment.
2. Discrimination in employment is prohibited.
3. Forced labor is prohibited.

### Article 5. Worker rights
Employees have the right to:
1. Work in a safe environment.
2. Receive fair wages.
3. Join labor unions.
4. Strike under lawful conditions.
5. Social insurance and health insurance.

## Chapter III: LABOR CONTRACTS

### Article 6. Contract forms
1. Written labor contract.
2. Verbal contract (for work under 1 month).
3. Electronic contract.

### Article 7. Contract types
1. Indefinite-term contract.
2. Fixed-term contract (12-36 months).
3. Seasonal or project-based contract.

### Article 8. Probation period
1. Maximum probation: 180 days for managers, 60 days for professionals, 6 days for others.
2. Probation salary: At least 85% of the official salary.

## Chapter IV: WAGES

### Article 9. Minimum wage
1. Regional minimum wages are set by the Government.
2. Employers must pay at least the minimum wage.

### Article 10. Overtime pay
1. Normal days: 150% of hourly wage.
2. Weekly rest days: 200% of hourly wage.
3. Public holidays: 300% of hourly wage.

---

*This is a sample/mock document for demonstration purposes only.*
`,
  },
];

// Main seed function
async function seedLegalDocuments() {
  console.log("🏛️  Seeding Legal Framework Documents...\n");

  try {
    // Get current documents index
    const currentDocs = await getDocumentsIndex();
    console.log(`📋 Current documents count: ${currentDocs.length}`);

    // Check if legal docs already exist
    const existingLegalDocs = currentDocs.filter(
      (doc: DocumentMetadata) => doc.category === LEGAL_CATEGORY
    );
    if (existingLegalDocs.length > 0) {
      console.log(
        `⚠️  Found ${existingLegalDocs.length} existing legal documents.`
      );
      console.log("   Existing legal docs will be kept, adding new ones...\n");
    }

    // Create new legal documents
    const newDocs: DocumentMetadata[] = [];

    for (const legalDoc of LEGAL_DOCUMENTS) {
      // Check if document already exists (by name)
      const exists = currentDocs.some(
        (doc: DocumentMetadata) => doc.name === legalDoc.name
      );
      if (exists) {
        console.log(`⏭️  Skipping "${legalDoc.name}" (already exists)`);
        continue;
      }

      const docId = generateDocId(legalDoc.name);
      const filename = `documents/${sanitizeFilename(legalDoc.name)}.md`;

      console.log(`📄 Creating: ${legalDoc.name}`);
      console.log(`   ID: ${docId}`);
      console.log(`   File: ${filename}`);

      // Upload content to S3
      const uploaded = await putDocument(
        filename,
        legalDoc.content,
        "text/markdown"
      );
      if (!uploaded) {
        console.error(`   ❌ Failed to upload ${filename}`);
        continue;
      }
      console.log(`   ✅ Uploaded to S3`);

      // Create document metadata
      const doc: DocumentMetadata = {
        id: docId,
        name: legalDoc.name,
        filename,
        type: "legal",
        category: LEGAL_CATEGORY, // Special category for law-of-the-land
        entityId: LEGAL_CATEGORY, // Special entity ID for law-of-the-land (applies to all)
        effectiveDate: legalDoc.enactmentDate,
        version: "1.0",
        pages: Math.ceil(legalDoc.content.length / 3000),
        language: "en",
        tags: legalDoc.tags,
        summary: legalDoc.summary,
        syncedToKB: false,
        // Legal-specific fields
        legalType: legalDoc.legalType,
        jurisdiction: legalDoc.jurisdiction,
        enactmentDate: legalDoc.enactmentDate,
      };

      newDocs.push(doc);
      console.log(`   📝 Metadata created\n`);
    }

    if (newDocs.length === 0) {
      console.log("\n✅ No new documents to add. All documents already exist.");
      return;
    }

    // Update documents index
    const updatedDocs = [...currentDocs, ...newDocs];
    const success = await updateDocumentsIndex(updatedDocs);

    if (success) {
      console.log(`\n✅ Successfully seeded ${newDocs.length} legal documents!`);
      console.log(`📊 Total documents in index: ${updatedDocs.length}`);
      console.log(
        `⚖️  Total legal documents: ${
          updatedDocs.filter(
            (d: DocumentMetadata) => d.category === LEGAL_CATEGORY
          ).length
        }`
      );
    } else {
      console.error("\n❌ Failed to update documents index");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error seeding legal documents:", error);
    process.exit(1);
  }
}

// Run the seed function
seedLegalDocuments();
