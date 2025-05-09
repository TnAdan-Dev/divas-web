// -----------------------------------------------------------------------------
import React from "react";
// -----------------------------------------------------------------------------
import UserLoggedContext from "@/contexts/User/UserLoggedContext.js";
import { PageUrls } from "@/utils/PageUtils";
// -----------------------------------------------------------------------------
import MoodboardEditor from "@/components/legacy/Moodboard/Editor/MoodboardEditor";

// -----------------------------------------------------------------------------
function Component() {
  return (
    <>
      <UserLoggedContext
        requiresLoggedUser={true}
        redirectTo={PageUrls.UserLogin}
      >
        <MoodboardEditor />
      </UserLoggedContext>
    </>
  );
}

// -----------------------------------------------------------------------------
export default Component;
