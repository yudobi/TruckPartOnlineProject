import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
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
  const { user, logout, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    phone_number: user?.phone_number || "",
    address: user?.address || "",
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUser({
        full_name: formData.full_name || null,
        phone_number: formData.phone_number || null,
        address: formData.address || null,
      });
      setIsEditing(false);
    } catch {
      // toast is already shown in updateUser
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || "",
      phone_number: user?.phone_number || "",
      address: user?.address || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-black pt-32 pb-20">
      <Helmet>
        <title>{t("user.profile")} | Tony Truck Parts</title>
        <meta name="robots" content="noindex" />
      </Helmet>
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
            {/* Full Name */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                {t("user.fullName")}
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  placeholder={t("user.fullNamePlaceholder")}
                  value={formData.full_name}
                  onChange={(e) => handleInputChange("full_name", e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              ) : (
                <p className="text-white">{formData.full_name || t("user.notProvided")}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                {t("user.phone")}
              </label>
              {isEditing ? (
                <Input
                  type="tel"
                  placeholder={t("user.phonePlaceholder")}
                  value={formData.phone_number}
                  onChange={(e) => handleInputChange("phone_number", e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              ) : (
                <p className="text-white">{formData.phone_number || t("user.notProvided")}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                {t("user.address")}
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  placeholder={t("user.addressPlaceholder")}
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              ) : (
                <p className="text-white">{formData.address || t("user.notProvided")}</p>
              )}
            </div>
          </div>

          {/* Edit Buttons */}
          {isEditing && (
            <div className="flex gap-3 mt-6 pt-6 border-t border-white/10">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? t("user.saving") : t("user.save")}
              </Button>
              <Button
                onClick={handleCancel}
                disabled={isSaving}
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
