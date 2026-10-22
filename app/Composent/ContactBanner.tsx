import TypingText from "./TypingText";

type ContactBannerProps = {
  text?: string;
};

export default function ContactBanner({
  text = "What we can do for our clients",
}: ContactBannerProps) {
  return (
    <div
      className="container-fluid p-4 mx-auto text-center"
      style={{ backgroundColor: "rgb(2, 6, 255)" }}
    >
      <div className="p-5 mx-auto text-center">
        <TypingText text={text} style={{ color: "rgb(250, 250, 250)" }} />
      </div>
    </div>
  );
}
