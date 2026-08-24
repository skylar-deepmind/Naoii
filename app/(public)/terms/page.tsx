import { LegalPage } from "@/components/LegalPage";
import { getDict } from "@/lib/i18n";

export default async function TermsPage() {
  const { legal } = await getDict();
  return <LegalPage title={legal.termsTitle} lead={legal.termsLead} sections={legal.termsSections} />;
}
