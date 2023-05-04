import SettingsPage from "@/components/settings";
import NavBar from "@/components/navbar";

function Settings() {
  return (
    <div>
      <NavBar showBackButton={true} />
      <SettingsPage />
    </div>
  );
}

export default Settings;