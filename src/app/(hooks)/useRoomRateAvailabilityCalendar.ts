// Import necessary modules and types
import Fetch from "@/utils/Fetch";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Dayjs } from "dayjs";

// Define interfaces for the data structures used in the calendar
export interface IRoomInventory {
  id: string;
  date: Dayjs;
  available: number;
  status: boolean;
  booked: number;
}

export interface IRoomRatePlans {
  id: number;
  name: string;
}

export interface IRateCalendar {
  id: string;
  date: Dayjs;
  rate: number;
  min_length_of_stay: number;
  reservation_deadline: number;
}

export interface IRatePlanCalendar extends IRoomRatePlans {
  calendar: Array<IRateCalendar>;
}

export interface IRoomCategory {
  id: string;
  name: string;
  occupancy: number;
}

export interface IRoomCategoryCalender extends IRoomCategory {
  inventory_calendar: Array<IRoomInventory>;
  rate_plans: Array<IRatePlanCalendar>;
}

// Define the parameters and response interfaces for the hook
interface IParams {
  property_id: number;
  start_date: string;
  end_date: string;
}

interface IResponse {
  room_categories: Array<IRoomCategoryCalender>;
  nextCursor?: number; // Available if you pass a cursor as a query param
}

// Custom hook to fetch room rate availability calendar data with infinite scrolling
export default function useRoomRateAvailabilityCalendar(params: IParams) {
  return useInfiniteQuery<IResponse>({
    // Unique query key to identify the query and enable caching
    queryKey: ["property_room_calendar", params],

    // Function to fetch paginated room rate calendar data
    queryFn: async ({ pageParam = 1 }) => {
      const url = new URL(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/property/${params.property_id}/rate-calendar/assessment`
      );

      // Append query parameters to the URL (start & end dates and pagination cursor)
      url.search = new URLSearchParams({
        start_date: params.start_date,
        end_date: params.end_date,
        cursor: String(pageParam),
      }).toString();

      // Fetch data from API using the helper function
      const response = await Fetch<IResponse>({
        method: "GET",
        url,
      });

      // Return fetched data, ensuring it conforms to IResponse structure
      return response.data ?? response;
    },

    // Initial page parameter (cursor starts from page 1)
    initialPageParam: 1,

    // Function to determine the next page's cursor from the last fetched page
    getNextPageParam: (lastPage) => lastPage?.nextCursor ?? null,
  });
}
