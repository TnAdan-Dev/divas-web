// -----------------------------------------------------------------------------
import React from "react";
// -----------------------------------------------------------------------------
import NET from "@/app/NET";
import _Link from "@/components/legacy/Link";
// -----------------------------------------------------------------------------
import { PageUrls } from "@/utils/PageUtils";
// -----------------------------------------------------------------------------
import CachedImage from "@/components/UI/Images/CachedImage";
import ImageDefaults from "@/components/UI/Images/ImageDefaults";
// -----------------------------------------------------------------------------
import styles from "./Feed.module.css";
import ProfileImage from "../../../../divas-client/components/UI/Images/ProfileImage";
import UserBasicInfo from "../../../../divas-client/components/UI/User/UserBasicInfo";
import Panel from "../../../../divas-client/components/UI/Containers/Panel";

// -----------------------------------------------------------------------------
function FeedItem({ moodboardModel, onClick }) {
  if (!moodboardModel) {
    return null;
  }

  //
  const user = moodboardModel.owner;

  const details_url = NET.Make_Navigation_Url(
    PageUrls.MoodboardDetails,
    moodboardModel._id
  );
  const photo_url = NET.Make_External_Image_Url(moodboardModel.photoUrl);

  //
  return (
    <Panel>
      <div className={styles.itemContainer}>
        <UserBasicInfo userModel={user} />

        <div>
          <_Link href={details_url}>
            <CachedImage
              imageUrl={photo_url + "l"}
              imagePlaceholderUrl={
                ImageDefaults.PLACEHOLDER_URL_MOODBOARD_GRID_ITEM
              }
            />
          </_Link>
        </div>
      </div>
    </Panel>
  );
}

// -----------------------------------------------------------------------------
export default FeedItem;
