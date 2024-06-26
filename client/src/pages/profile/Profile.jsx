import "./profile.scss";
import FacebookTwoToneIcon from "@mui/icons-material/FacebookTwoTone";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import PlaceIcon from "@mui/icons-material/Place";
import LanguageIcon from "@mui/icons-material/Language";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Posts from "../../components/posts/Posts";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useLocation } from "react-router-dom";
import { useContext, useEffect } from "react";
import { AuthContext } from "../../context/authContext";
import Update from "../../components/update/Update";
import { useState } from "react";

const Profile = () => {
  const [openUpdate, setOpenUpdate] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const [friends, setFriends] = useState([]);


  const userId = parseInt(useLocation().pathname.split("/")[2]);

  const { isLoading, data: isdata } = useQuery(["user"], () =>
    makeRequest.get("/users/find/" + userId).then((res) => {
      return res.data[0];
    })
  );
  console.log(isdata)

  const { isLoading: rIsLoading, data: relationshipData } = useQuery(
    ["relationship"],
    () =>
      makeRequest.get("/relationships?followedUserId=" + userId).then((res) => {
        return res.data;
      })
  );

  const queryClient = useQueryClient();
  const mutation = useMutation(
    (following) => {
      if (following)
        return makeRequest.delete("/relationships?userId=" + userId);
      return makeRequest.post("/relationships", { userId });
    },
    {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries(["relationship"]);
      },
    }
  );

  const handleFollow = async () => {
    mutation.mutate(relationshipData.includes(currentUser.id));
    const message = {
      senderId: currentUser.id,
      recieverId: userId,
    };
    await makeRequest.post("/conversations/", message);
    const resa = await makeRequest.post("/conversations/", message);
    setFriends(resa.data)

    const message2 = {
      conversationId: friends[0].id,
      senderId: currentUser.id,
      reciever: friends[0].recieverId,
      text: "Hi",
    };
    await makeRequest.post("/messages/", message2);
  };
  // console.log(data[0].id)
  return (
    <div className="profile">
      {
        isLoading ? (
          "loading"
        ) :
          (
            <>
              <div className="images">
                <img src={"/upload/" + isdata.coverPic} alt="" className="cover" />
                <img src={"/upload/" + isdata.profilePic} alt="" className="profilePic" />
              </div>
              <div className="profileContainer">
                <div className="uInfo">
                  <div className="left">
                    <a href="http://facebook.com">
                      <FacebookTwoToneIcon fontSize="large" />
                    </a>
                    <a href="http://instagram.com">
                      <InstagramIcon fontSize="large" />
                    </a>
                    <a href="http://x.com">
                      <TwitterIcon fontSize="large" />
                    </a>
                    <a href="http://linkedin.in">
                      <LinkedInIcon fontSize="large" />
                    </a>
                  </div>
                  <div className="center">
                    <span>{isdata.name}</span>
                    <div className="info">
                      <div className="item">
                        <PlaceIcon />
                        <span>{isdata.city}</span>
                      </div>
                      <div className="item">
                        <LanguageIcon />
                        <span>{isdata.website}</span>
                      </div>
                    </div>
                    {rIsLoading ? (
                      "loading"
                    ) : userId === currentUser.id ? (
                      <button onClick={() => setOpenUpdate(true)}>update</button>
                    ) : (
                      <button onClick={handleFollow} >
                        {relationshipData.includes(currentUser.id)
                          ? "Following"
                          : "Follow"}
                      </button>
                    )}
                  </div>
                  <div className="right">
                    <EmailOutlinedIcon />
                    <MoreVertIcon />
                  </div>
                </div>
                <Posts userId={userId} />
              </div>
            </>
          )}
      {openUpdate && <Update setOpenUpdate={setOpenUpdate} user={isdata} />}
    </div>
  );
};

export default Profile;
