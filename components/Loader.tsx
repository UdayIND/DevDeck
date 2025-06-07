import Image from "next/image";
import LoaderIcon from "public/assets/lineicons/regular-free-icon-svgs/cloud-refresh-clockwise.svg";

function Loader() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-2">
      <Image
        src={LoaderIcon}
        alt="loader"
        width={100}
        height={100}
        className="object-contain"
        priority
        unoptimized
      />
      <p className="text-sm font-bold text-primary-grey-300">Loading...</p>
    </div>
  );
}

export default Loader;
