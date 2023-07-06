import { type NextPage } from "next";
import Head from "next/head";



const  SinglePostPage: NextPage = ()=> {

  return (
    <>
      <Head>
        <title>Post</title>
        <meta name="description" content="🤖" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="w-full h-full md:max-w-2xl border-x border-slate-400 ">
          POST BView
        </div>
        
      </main>
    </>
  );
}

export default SinglePostPage;
