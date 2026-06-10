import FloatingBackgroundPhotos from "./FloatingBackgroundPhotos";

export default function PublicAtmosphere({ variant = "default" }) {
  return (
    <div className={`publicAtmosphere publicAtmosphere--${variant}`} aria-hidden="true">
      <div className="publicBackdropOrb publicBackdropOrbOne" />
      <div className="publicBackdropOrb publicBackdropOrbTwo" />
      <div className="publicBackdropOrb publicBackdropOrbThree" />
      <FloatingBackgroundPhotos />
      <div className="publicBackdropGrid" />
    </div>
  );
}
