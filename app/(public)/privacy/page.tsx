import { LegalPage } from "@/components/LegalPage";
import { getDict } from "@/lib/i18n";

export default async function PrivacyPage() {
  const { legal } = await getDict();
  return <LegalPage title={legal.privacyTitle} lead={legal.privacyLead} sections={legal.privacySections} />;
}
