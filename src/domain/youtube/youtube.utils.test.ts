import { getYouTubeVideoId } from "./youtube.utils";

describe("getYouTubeVideoId", () => {
  it("should return video ID from standard watch URL", () => {
    expect(
      getYouTubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
    ).toBe("dQw4w9WgXcQ");
  });

  it("should return video ID from short youtu.be URL", () => {
    expect(getYouTubeVideoId("https://youtu.be/dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ",
    );
  });

  it("should return video ID from embed URL", () => {
    expect(getYouTubeVideoId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ",
    );
  });

  it("should return video ID from v URL", () => {
    expect(getYouTubeVideoId("https://www.youtube.com/v/dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ",
    );
  });

  it("should return video ID from URL with extra query parameters", () => {
    expect(
      getYouTubeVideoId(
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ&feature=youtu.be&t=42s",
      ),
    ).toBe("dQw4w9WgXcQ");
  });

  it("should return video ID from short URL with query parameters", () => {
    expect(getYouTubeVideoId("https://youtu.be/dQw4w9WgXcQ?t=42")).toBe(
      "dQw4w9WgXcQ",
    );
  });

  it("should return the ID itself if a valid ID string is passed", () => {
    expect(getYouTubeVideoId("dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("should return null for invalid ID string", () => {
    expect(getYouTubeVideoId("dQw4w9WgXc")).toBe(null); // Too short
    expect(getYouTubeVideoId("dQw4w9WgXcQ!")).toBe(null); // Invalid char
  });

  it("should return null for completely invalid URL", () => {
    expect(
      getYouTubeVideoId("https://www.example.com/watch?v=dQw4w9WgXcQ"),
    ).toBe(null);
  });

  it("should return null for a URL that looks like youtube but is not", () => {
    expect(
      getYouTubeVideoId("https://www.notyoutube.com/watch?v=dQw4w9WgXcQ"),
    ).toBe(null);
  });

  it("should return null for empty string input", () => {
    expect(getYouTubeVideoId("")).toBe(null);
  });

  it("should handle URLs without http/https", () => {
    expect(getYouTubeVideoId("www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ",
    );
    expect(getYouTubeVideoId("youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  // Add more test cases based on the regexes in the actual function
  // For example, the user profile URL structure:
  // it('should return video ID from user profile URL (if supported by regex)', () => {
  //   expect(getYouTubeVideoId('https://www.youtube.com/user/officialchannel#p/a/u/1/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  // });
  // The current regex for user does not seem to support this specific format, it's more of a fallback.
  // The last regex /([a-zA-Z0-9_-]{11})/ might catch IDs in other places, so it's good to test its behavior.
  // Let's ensure the primary regexes are tested thoroughly.

  it("should return null for invalid youtube channel URL that happens to have 11 chars", () => {
    expect(
      getYouTubeVideoId(
        "https://www.youtube.com/channel/UC-lHJZR3Gqxm24_Vd_AJ5Yw",
      ),
    ).toBe(null);
    // The above is a channel ID and should not be mistaken for a video ID unless the fallback is too aggressive.
    // The current implementation of getYouTubeVideoId should correctly return null for this.
  });
});
