export type EventItem = {
  title: string;
  image: string;
  slug: string;
  location: string;
  date: string;
  time: string;
};

export const events: EventItem[] = [
  {
    title: "Google I/O",
    image: "/images/event1.png",
    slug: "google-io-2024",
    location: "Shoreline Amphitheatre, Mountain View, CA",
    date: "May 14-15, 2024",
    time: "9:00 AM - 5:00 PM PT",
  },
  {
    title: "React Conf",
    image: "/images/event2.png",
    slug: "react-conf-2024",
    location: "Henderson, Nevada",
    date: "May 15-16, 2024",
    time: "9:00 AM - 6:00 PM PT",
  },
  {
    title: "WWDC",
    image: "/images/event3.png",
    slug: "wwdc-2025",
    location: "Apple Park, Cupertino, CA",
    date: "June 9-13, 2025",
    time: "10:00 AM - 5:00 PM PT",
  },
  {
    title: "GitHub Universe",
    image: "/images/event4.png",
    slug: "github-universe-2024",
    location: "Fort Mason, San Francisco, CA",
    date: "October 29-30, 2024",
    time: "9:00 AM - 5:00 PM PT",
  },
  {
    title: "KubeCon + CloudNativeCon North America",
    image: "/images/event5.png",
    slug: "kubecon-na-2024",
    location: "Salt Palace Convention Center, Salt Lake City, UT",
    date: "November 12-15, 2024",
    time: "8:00 AM - 6:00 PM MT",
  },
  {
    title: "AWS re:Invent",
    image: "/images/event6.png",
    slug: "aws-reinvent-2024",
    location: "The Venetian, Las Vegas, NV",
    date: "December 2-6, 2024",
    time: "8:00 AM - 6:00 PM PT",
  },
];

export default events;