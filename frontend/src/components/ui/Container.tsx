import type { JSX } from "react";

const Container = ({ className, children }: { className?: string; children?: JSX.Element }) => {
	return <div className={className}>{children}</div>;
};

export { Container };
