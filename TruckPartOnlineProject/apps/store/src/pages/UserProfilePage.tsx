import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router";
import { useState, useCallback } from "react";
import {
  User,
  Mail,
  Edit2,
  LogOut,
  ChevronRight,
  Save,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function UserProfilePage() {
  const { t } = useTranslation();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone: user?.phone || "",
    country: user?.country || "",
    city: user?.city || "",
    state: user?.state || "",
    postal_code: user?.postal_code || "",
  });

  const handleLogout = useCallback(() => {
    logout();
    navigate("/auth");
  }, [logout, navigate]);

  // Redirigir si no está autenticado
  if (!isAuthenticated) {
    navigate("/auth");
    return null;
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    // TODO: Implementar guardado en backend
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      phone: user?.phone || "",
      country: user?.country || "",
      city: user?.city || "",
      state: user?.state || "",
      postal_code: user?.postal_code || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-black pt-32 pb-20">
      <div className="container mx-auto px-6 max-w-2xl">
        {/* Header */}
        <div className="bg-zinc-950 border border-white/5 rounded-sm p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-600 to-orange-800 flex items-center justify-center text-white shadow-lg shadow-orange-900/20 border-2 border-orange-600/30">
                <User className="w-12 h-12" />
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-black tracking-tighter text-white mb-1">
                  {user?.username}
                </h1>
                <p className="text-gray-400 text-sm mb-3">{user?.email}</p>
                <div className="inline-flex items-center px-3 py-1 bg-orange-600/10 border border-orange-600/30 rounded-sm">
                  <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">
                    {t("common.customer")}
                  </span>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-white/5 hover:bg-orange-600 text-white border border-white/10"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                {t("user.edit")}
              </Button>
            )}
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-zinc-950 border border-white/5 rounded-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-orange-600" />
              {t("user.personalInfo")}
            </h2>
          </div>

          <div className="space-y-4">
            {/* Phone */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                {t("user.phone")}
              </label>
              {isEditing ? (
                <Input
                  type="tel"
                  placeholder={t("user.phonePlaceholder")}
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              ) : (
                <p className="text-white">{formData.phone || t("user.notProvided")}</p>
              )}
            </div>

            {/* Country */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                {t("user.country")}
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  placeholder={t("user.countryPlaceholder")}
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              ) : (
                <p className="text-white">{formData.country || t("user.notProvided")}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                {t("user.city")}
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  placeholder={t("user.cityPlaceholder")}
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              ) : (
                <p className="text-white">{formData.city || t("user.notProvided")}</p>
              )}
            </div>

            {/* State */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                {t("user.state")}
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  placeholder={t("user.statePlaceholder")}
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              ) : (
                <p className="text-white">{formData.state || t("user.notProvided")}</p>
              )}
            </div>

            {/* Postal Code */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                {t("user.postalCode")}
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  placeholder={t("user.postalCodePlaceholder")}
                  value={formData.postal_code}
                  onChange={(e) => handleInputChange("postal_code", e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              ) : (
                <p className="text-white">{formData.postal_code || t("user.notProvided")}</p>
              )}
            </div>
          </div>

          {/* Edit Buttons */}
          {isEditing && (
            <div className="flex gap-3 mt-6 pt-6 border-t border-white/10">
              <Button
                onClick={handleSave}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {t("user.save")}
              </Button>
              <Button
                onClick={handleCancel}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10"
              >
                <X className="w-4 h-4 mr-2" />
                {t("user.cancel")}
              </Button>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-zinc-950 border border-white/5 rounded-sm overflow-hidden mb-6">
          <button className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors group border-b border-white/5 last:border-b-0">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-orange-600" />
              <div className="text-left">
                <p className="text-sm font-bold text-white">{t("user.myOrders")}</p>
                <p className="text-xs text-gray-400">{t("user.viewAllOrders")}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-zinc-950 border border-white/5 rounded-sm p-6">
          <Button
            onClick={handleLogout}
            className="w-full bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/30 hover:border-red-600 transition-all py-3"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t("user.logout")}
          </Button>
        </div>
      </div>
    </div>
  );
}
