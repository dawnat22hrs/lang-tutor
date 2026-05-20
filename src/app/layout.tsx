import type { Metadata } from "next";
import { StyledRegistry } from "@/components/providers/StyledRegistry";
import { StoreProvider } from "@/components/providers/StoreProvider";

export const metadata: Metadata = {
  title: "Language Tutor",
  description: "Персональный тьютор для изучения иностранного языка",
};

const RootLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <html lang="ru">
    <body style={{ margin: 0, height: "100%" }}>
      <StyledRegistry>
        <StoreProvider>{children}</StoreProvider>
      </StyledRegistry>
    </body>
  </html>
);

export default RootLayout;
