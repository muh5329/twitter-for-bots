
import Link from "next/link";
import { SignIn , SignInButton, SignOutButton, useUser} from "@clerk/nextjs";
import { RouterOutputs, api } from "~/utils/api";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { useState } from "react";
import toast from "react-hot-toast";
import { PageLayout } from "~/components/layout";

dayjs.extend(relativeTime)



type PostWithUser = RouterOutputs["posts"]["getAll"][number];
const PostView = (props: PostWithUser) => {
  const {post, author} = props
  return (<div  className="flex p-4 border-b border-slate-400 gap-3" key={post.id}> 
        <Image src={author?.profileImageUrl} alt={`@${author.username}'s profile picture`} className="w-14 h-14 rounded-full" width={56} height={56} />
        <div className="flex flex-col ">
          <div className="flex text-slate-300 gap-1">
            <Link href={`/@${author.username}`}><span>{`@${author.username!}`}</span></Link>
            <Link href={`/post/${post.id}`}><span className="font-thin"> {`· ${dayjs(post.createdAt).fromNow()}`}</span></Link>
          </div>
          <span className=" text-xl break-all">{post.content}</span>
          
        </div>
        
    </div>
  )
}

const CreatePostWizard = () => {
  const {user} = useUser();

  const [input, setInput] = useState("");

  const ctx  = api.useContext();


  const {mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () =>{
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) =>{
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]){
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post, please try again");
      }
    }
  });

  if (!user) return null; 

    return <div className="flex gap-3 w-full">
      <Image src={user.profileImageUrl} alt="Profile image" className="w-14 h-14 rounded-full" width={56} height={56}/>
      <input 
        className=" bg-transparent grow outline-none" 
        placeholder="Type some Stuff"  
        type="text" 
        value={input} 
        onChange={(e)=> setInput(e.target.value)} 
        onKeyDown={(e)=>{
          if (e.key == "Enter"){
            e.preventDefault();
            if (input !== ""){
              mutate({ content: input})
            }
          }
        }}
        disabled={isPosting}
      />
      {input !== "" && !isPosting && <button onClick={() => mutate({ content: input })}>Post</button>}
      {isPosting && <div className="flex justify-center items-center"><LoadingSpinner size={20} /></div>}
    </div>
}

const Feed = () => {
  const {data, isLoading: postsLoading} = api.posts.getAll.useQuery();
  
  if (postsLoading) return <LoadingPage />
  if (!data) return <div>Something went wrong</div>
  return ( 
    <div className="flex flex-col" >
      {data.map((fullPost)=>(<PostView {...fullPost} key={fullPost.post.id} />))}  
    </div>
  )
}

export default function Home() {
  const { isLoaded: userLoaded, isSignedIn} =  useUser();

  // Pre Fetch
  api.posts.getAll.useQuery();

  if (!userLoaded ) return <div />


  return (
    <>
        <PageLayout>
          <div className=" border-b border-slate-400 p-4 ">
              <div className="flex justify-center">
                {!isSignedIn && <SignInButton /> }
              </div>
              <div className="flex ">
                {isSignedIn && <CreatePostWizard/> }
              </div>
          </div>
          <Feed />
        </PageLayout>
    </>
  );
}
