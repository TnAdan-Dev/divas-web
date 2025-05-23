// -----------------------------------------------------------------------------
import { StatusCodes } from "http-status-codes";
// -----------------------------------------------------------------------------
import Endpoints from "@/divas-shared/shared/API/Endpoints";
// -----------------------------------------------------------------------------
import NET from "@/app/NET";
import Result from "@/app/Result";
// -----------------------------------------------------------------------------
import Assert from "@/utils/Assert";
// -----------------------------------------------------------------------------
import UserModel from "@/models/UserModel";


// -----------------------------------------------------------------------------
class UserService
{
  // ---------------------------------------------------------------------------
  static async GetUserWithUsername(username)
  {
    Assert.NotNull(username);

    // @Incomplete: Maybe cache???
    const api_url = NET.Make_API_Url(Endpoints.User.GetByUsername, username);

    const response = await NET.GET(api_url);
    if(response.status != StatusCodes.OK) {
      return Result.ResponseError(response);
    }

    const data = await response.json();
    const user = UserModel.CreateFromServerData(data);

    return Result.Valid(user);
  }

  // ---------------------------------------------------------------------------
  static async GetUserWithId(id)
  {
    Assert.NotNull(id);

    try {
      const api_url = NET.Make_API_Url(Endpoints.User.GetById, id);

      const response = await NET.GET(api_url);
      if(response.status != StatusCodes.OK) {
        return await Result.ResponseError(response);
      }

      const data = await response.json();
      const user = UserModel.CreateFromServerData(data);

      return Result.Valid(user);
    }
    catch(error) {
      return Result.ExceptionError(error);
    }
  }
  //
  // Followers / Following
  //

  // ---------------------------------------------------------------------------
  static async GetAllFollowingOfUser(userId)
  {
    Assert.NotNull(userId);

    try {
      const api_url = NET.Make_API_Url( Endpoints.User.GetFollowing, userId);

      const response = await NET.GET(api_url);
      if(response.status != StatusCodes.OK) {
        return await Result.ResponseError(response);
      }

      const data = await response.json();
      return Result.Valid(data);
    }
    catch(error) {
      return Result.ExceptionError(error);
    }
  }

  // ---------------------------------------------------------------------------
  static async GetAllFollowersOfUser(userId)
  {
    Assert.NotNull(userId);

    try {
      const api_url = NET.Make_API_Url(Endpoints.User.GetFollowers, userId);

      const response = await NET.GET(api_url);
      if(response.status != StatusCodes.OK) {
        return await Result.ResponseError(response);
      }

      const data = await response.json();
      return Result.Valid(data);
    }
    catch(error) {
      return Result.ExceptionError(error);
    }
  }


  // ---------------------------------------------------------------------------
  static async CreateUserWithData(data, photo)
  {
    //
    Assert.NotNullOrEmpty(data.username);
    Assert.NotNullOrEmpty(data.email);
    Assert.NotNullOrEmpty(data.password);

    Assert.NotNullOrEmpty(data.fullname);
    Assert.NotNullOrEmpty(data.description);

    Assert.NotNull(photo);

    //
    {
      const form_data = new FormData();
      form_data.append("photo", photo);

      const api_url  = NET.Make_API_Url(Endpoints.User.UploadProfilePhoto);
      const response = await NET.POST_DATA(api_url, form_data);

      if(response.status != StatusCodes.CREATED) {
        return await Result.ResponseError(response);
      }

      const response_data  = await response.json();
      data.profilePhotoUrl = response_data.photoPath;
    }

    //
    {
      const api_url  = NET.Make_API_Url(Endpoints.User.Create);
      const response = await NET.POST_JSON(api_url, data);

      if(response.status != StatusCodes.CREATED) {
        return await Result.ResponseError(response);
      }

      const json = await response.json();
      const user = UserModel.CreateFromServerData(json);
      return Result.Valid(user);
    }
  }


  // ---------------------------------------------------------------------------
  static async UpdateUserWithData(data, photo)
  {
    //
    if(photo) {
      const form_data = new FormData();
      form_data.append("photo", photo);

      const api_url  = NET.Make_API_Url(Endpoints.User.UploadProfilePhoto);
      const response = await NET.POST_DATA(api_url, form_data);

      if(response.status != StatusCodes.CREATED) {
        return await Result.ResponseError(response);
      }

      const response_data  = await response.json();
      data.profilePhotoUrl = response_data.photoPath;
    }

    //
    {
      const api_url  = NET.Make_API_Url(Endpoints.User.Update, data.userId);
      const response = await NET.PATCH_JSON(api_url, data);

      if(response.status != StatusCodes.OK) {
        return await Result.ResponseError(response);
      }

      const json = await response.json();
      return Result.Valid(json);
    }
  }


  // ---------------------------------------------------------------------------
  static async ToggleFollowUser(followData)
  {
    const api_url  = NET.Make_API_Url(Endpoints.User.ToggleFollow);
    const response = await NET.POST_JSON(api_url, followData);

    if(response.status != StatusCodes.OK) {
      return await Result.ResponseError(response);
    }

    const json = await response.json();
    return Result.Valid(json);
  }
}

// -----------------------------------------------------------------------------
export default UserService;