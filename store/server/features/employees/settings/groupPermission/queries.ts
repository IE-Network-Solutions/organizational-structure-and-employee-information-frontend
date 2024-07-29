import { ORG_AND_EMP_URL } from "@/utils/constants";
import { crudRequest } from "@/utils/crudRequest";
import axios from "axios";
import { useQuery } from "react-query";

/**
 * Function to fetch posts by sending a GET request to the API
 * @returns The response data from the API
 */
const getPermissionGroups = async () => {
    return crudRequest({url:`${ORG_AND_EMP_URL}/permission-group` ,  method:"GET" });
  }
  
   /**
   * Function to fetch a single post by sending a GET request to the API
   * @param id The ID of the post to fetch
   * @returns The response data from the API
   */
  
  const getPermissionGroup =async(id:number)=>{
      try {
          const response = await axios.get(`${ORG_AND_EMP_URL}/permission-group/${id}`);
          return response.data;
        } catch (error) {
          throw error;
        }
      
  }
  
  
  /**
   * Custom hook to fetch a list of posts using useQuery from react-query.
   * 
   * @returns The query object for fetching posts.
   * 
   * @description
   * This hook uses `useQuery` to fetch a list of posts from the API. It returns
   * the query object containing the posts data and any loading or error states.
   */
  export const useGetPermissionGroups = ()=> useQuery<any[]>("groupPermissions" , getPermissionGroups)
  
  /**
   * Custom hook to fetch a single post by ID using useQuery from react-query.
   * 
   * @param postId The ID of the post to fetch
   * @returns The query object for fetching the post.
   * 
   * @description
   * This hook uses `useQuery` to fetch a single post by its ID. It returns the
   * query object containing the post data, and it keeps the previous data
   * while the new data is being fetched.
   */
  export const useGetPermissionGroup =(postId:number)=> useQuery<any>(['groupPermissions' , postId] , ()=> getPermissionGroup(postId) , {
      keepPreviousData:true
  } )