import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
	title: "NodeFlow",
	description: "A hierarchal file structure demo",
};

const inter = Inter({
	weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
	display: "swap",
	variable: "--font-inter",
	subsets: ["latin"],
});
export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				style={{
					backgroundImage:
						"radial-gradient(circle at 0.5px 0.5px, var(--dot-color, rgba(6, 182, 212, 0.2)) 0.7px, transparent 0)",
					backgroundSize: "8px 8px",
					backgroundRepeat: "repeat",
					animation: "dotColorChange 10s infinite ease alternate",
				}}
				className={`${inter.className} antialiased w-full h-screen`}
			>
				{children}
				<Toaster />
				<script
					data-name="BMC-Widget"
					data-cfasync="false"
					src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js"
					data-id="aaratbatra"
					data-description="Support me on Buy me a coffee!"
					data-message=""
					data-color="#f2df0a"
					data-position="Left"
					data-x_margin="18"
					data-y_margin="18"
				></script>
			</body>
		</html>
	);
}
