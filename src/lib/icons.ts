/**
 * @file src/lib/icons.ts
 *
 * Single source of truth for every icon used in Voxara.
 *
 * lucide-react v1.x removed brand icons (YouTube, Instagram, LinkedIn, etc.)
 * due to trademark restrictions. Those are sourced from react-icons instead
 * and re-exported under simple aliases so all component imports stay clean.
 *
 * Usage:
 *   import { IconYoutube, IconInstagram, Check, Loader2 } from "@/lib/icons";
 */

// ─── lucide-react (all non-brand icons) ─────────────────────────────────────
export {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart2,
  Bell,
  Briefcase,
  Camera,
  Check,
  CheckCheck,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Circle,
  Clapperboard,
  Clock,
  Coins,
  Copy,
  CreditCard,
  Crown,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Gift,
  Globe,
  HelpCircle,
  Layers,
  Link2,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Menu,
  Mic,
  MoreHorizontal,
  MousePointer,
  Music2,
  PanelLeft,
  PlayCircle,
  PlusCircle,
  RefreshCw,
  Scissors,
  Search,
  Send,
  Settings,
  Share2,
  Shield,
  ShoppingCart,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  Upload,
  User,
  UserPlus,
  Users,
  Video,
  Volume2,
  Wand2,
  X,
  XCircle,
  Zap,
} from "lucide-react";

// ─── react-icons brand icons (not in lucide-react v1.x) ─────────────────────
// Aliased with "Icon" prefix for clarity at call sites.

export { FaYoutube  as IconYoutube  } from "react-icons/fa";
export { FaInstagram as IconInstagram } from "react-icons/fa";
export { FaLinkedin as IconLinkedin } from "react-icons/fa";
export { FaFacebook as IconFacebook } from "react-icons/fa";
export { FaXTwitter as IconXTwitter  } from "react-icons/fa6";
export { FaTiktok   as IconTiktok   } from "react-icons/fa6";
