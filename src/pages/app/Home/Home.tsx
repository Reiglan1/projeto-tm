import useSWR from "swr";
import fetcher from "@/services/api";

export default function HomePage() {
  const { data, error } = useSWR("/", fetcher, { suspense: true });
  console.log(data?.results);

  return (
    <div className="container flex flex-col flex-1">
      <div className="bg-green-100 flex-1 p-5">
        <h1 className="text-2xl my-10">
          <strong>Home</strong>
        </h1>
        <div className="relative overflow-x-auto">
          {data?.results?.map((opt: any, index: any) => {
            return <div key={index}>{opt?.cell}</div>;
          })}
        </div>
      </div>
    </div>
  );
}
