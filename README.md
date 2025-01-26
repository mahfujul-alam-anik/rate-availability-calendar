# Project Documentation

## Setup Instructions

Follow the steps below to set up and run the project successfully:

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <project-directory>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root and add the following:

```env
NEXT_PUBLIC_BACKEND_URL=https://beta.api.bytebeds.com
```

### 4. Run the Project

```bash
npm start
```

The application should now be running successfully.

---

## Infinite Scrolling Implementation

### Objective

The goal was to implement infinite scrolling for the **Room Rate Availability Calendar**, ensuring that additional data loads dynamically as the user scrolls.

### Approach

I utilized **React Query's `useInfiniteQuery`** to fetch paginated data efficiently and implemented an intersection observer to trigger data loading when the user reaches the end of the list.

### Code Implementation

#### Using `useInfiniteQuery`

The `useRoomRateAvailabilityCalendar` custom hook now utilizes `useInfiniteQuery` from React Query to fetch paginated data efficiently.

```tsx
return useInfiniteQuery<IResponse>({
  queryKey: ["property_room_calendar", params],
  queryFn: async ({ pageParam = 1 }) => {
    const url = new URL(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/property/${params.property_id}/rate-calendar/assessment`
    );
    url.search = new URLSearchParams({
      start_date: params.start_date,
      end_date: params.end_date,
      cursor: String(pageParam),
    }).toString();

    const response = await Fetch<IResponse>({ method: "GET", url });
    return response.data ?? response;
  },
  initialPageParam: 1,
  getNextPageParam: (lastPage) => lastPage?.nextCursor ?? null,
});
```

#### Fetching Next Page Data

I implemented a `fetchNextPage` function to load new data when the end of the content is in view.

```tsx
const fetchNextPage = useCallback(() => {
  if (room_calendar.hasNextPage && !room_calendar.isFetchingNextPage) {
    room_calendar.fetchNextPage();
  }
}, [room_calendar]);
```

#### Infinite Scrolling Logic

I leveraged the `inView` property to detect when the user reaches the bottom and trigger the next page fetch.

```tsx
useEffect(() => {
  const pages = room_calendar?.data?.pages;

  // Check if any page has an empty room_categories array
  const hasEmptyCategory = pages?.some(
    (page) => page.room_categories.length === 0
  );

  if (inView && !hasEmptyCategory) {
    fetchNextPage();
  }
}, [inView, fetchNextPage, room_calendar]);
```

#### Rendering Data with Infinite Scroll

```tsx
{
  room_calendar?.data?.pages.map((page, pageIndex) => (
    <div key={pageIndex}>
      {page.room_categories.map((room_category, categoryIndex) => (
        <RoomRateAvailabilityCalendar
          key={categoryIndex}
          index={categoryIndex}
          InventoryRefs={InventoryRefs}
          isLastElement={categoryIndex === page.room_categories.length - 1}
          room_category={room_category}
          handleCalenderScroll={handleCalenderScroll}
        />
      ))}
    </div>
  ));
}

{
  /* Observer Element */
}
{
  room_calendar.isSuccess && room_calendar.data?.pages?.length > 0 && (
    <div ref={ref}></div>
  );
}
```

#### Loading Indicator

```tsx
{
  room_calendar.isLoading ||
    (room_calendar?.isFetchingNextPage && (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <CircularProgress />
      </Box>
    ));
}
```

---

## Scroll Performance Optimization

### Objective

The existing horizontal scroll behavior had performance issues such as lagging and unresponsiveness. I optimized it to ensure a smooth and responsive scrolling experience.

### Optimizations Applied

1. **CSS Enhancements:**

   - Added `scroll-behavior: smooth` to improve smooth scrolling.
   - Implemented `-Ibkit-overflow-scrolling: touch` for better mobile support.

   ```css
   html {
     max-width: 100vw;
     overflow-x: hidden;
     scroll-behavior: smooth;
     -webkit-overflow-scrolling: touch;
   }
   ```

   **How `useInfiniteQuery` Helps Optimize Scroll Performance:**

- Efficient Data Fetching: Loads data in chunks to prevent UI freezes.
- Automatic Fetching on Demand: Triggers requests only when necessary.
- Cache Management: Ensures previously loaded data remains available.
- Parallel Fetching & Background Updates: Allows smooth UI interactions.
- Pagination Control: Manages cursor efficiently to prevent redundant calls.

### Testing

I ensured the scroll performance was smooth across:

- Different devices (desktop, tablet, mobile)
- Various browsers (Chrome, Firefox, Safari)

---

## Project Live Link

https://rate-availability-calendar-blond.vercel.app/

---

## Future Improvements

- Implement virtualized rendering for improved performance.
- Enhance accessibility features for better UX.
- Add unit tests to validate infinite scrolling logic.

---

### Author

**Mahfujul Alam Anik**

---

Thank you for reviewing this submission.
