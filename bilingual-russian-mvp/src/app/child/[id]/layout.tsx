export function generateStaticParams() {
  return [{ id: "lana" }, { id: "misha" }, { id: "sofia" }];
}

export default function ChildSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
