/**
 * CANONICAL LEADER PROFILE DATA
 * 
 * This file contains the official, structured LeaderProfile data for military leaders.
 * All data follows the normalization rules and institutional military format.
 */

import type { LeaderProfile } from '../components/ui/MinistryLeadersList'

/**
 * Phan Văn Giang - Đại tướng, Bộ trưởng Bộ Quốc phòng
 * Canonical LeaderProfile data following institutional military format
 */
export const phanVanGiangProfile: LeaderProfile = {
  id: "phan-van-giang",
  name: "Phan Văn Giang",
  image: "/src/assets/dai-tuong-phan-van-giang.jpg",

  currentTitles: [
    "Ủy viên Bộ Chính trị",
    "Phó Bí thư Quân ủy Trung ương",
    "Ủy viên Ban Thường vụ Đảng ủy Chính phủ",
    "Bộ trưởng Bộ Quốc phòng"
  ],

  personalInfo: {
    fullName: "Phan Văn Giang",
    birthDate: "14/10/1960",
    partyJoinDate: "04/12/1982",
    hometown: "Tỉnh Ninh Bình",
    positions: [
      "Ủy viên Bộ Chính trị: Khóa XIII, XIV",
      "Ủy viên Trung ương Đảng: Khóa XII, XIII, XIV",
      "Ủy viên Ban Thường vụ Đảng ủy Chính phủ",
      "Phó Bí thư Quân ủy Trung ương",
      "Đại tướng (từ 7/2021), Bộ trưởng Bộ Quốc phòng (từ 4/2021)",
      "Ủy viên Hội đồng Quốc phòng và An ninh",
      "Đại biểu Quốc hội: Khóa XV"
    ],
    politicalTheoryLevel: "Cao cấp",
    professionalLevel: "Tiến sĩ Khoa học quân sự"
  },

  careerTimeline: [
    {
      year: "8/1978 - 11/1979",
      title: "Chiến sĩ",
      description: "Tiểu đoàn 4, Trung đoàn 677, Sư đoàn 346 (Chiến đấu tại Cao Bằng)."
    },
    {
      year: "12/1979 - 4/1980",
      title: "Chiến sĩ ôn văn hóa",
      description: "Trường Văn hoá Quân khu 1."
    },
    {
      year: "5/1980 - 8/1983",
      title: "Học viên",
      description: "Trường Sĩ quan Chỉ huy kỹ thuật Tăng."
    },
    {
      year: "9/1983 - 9/1984",
      title: "Trung úy, Trung đội trưởng",
      description: "Đại đội 3, Tiểu đoàn 1037, Sư đoàn 312, Quân đoàn 1."
    },
    {
      year: "10/1984 - 4/1986",
      title: "Chi ủy viên, Thượng úy, Phó Đại đội trưởng Kỹ thuật",
      description: "Đại đội 1, Tiểu đoàn 1037, Sư đoàn 312, Quân đoàn 1."
    },
    {
      year: "5/1986 - 3/1989",
      title: "Phó Bí thư Chi bộ, Đại úy, Đại đội trưởng",
      description: "Đại đội 1, Tiểu đoàn 1037, Sư đoàn 312, Quân đoàn 1."
    },
    {
      year: "4/1989 - 8/1990",
      title: "Đảng ủy viên Tiểu đoàn, Đại úy, Phó Tiểu đoàn trưởng - Tham mưu trưởng",
      description: "Tiểu đoàn 1037, Sư đoàn 312, Quân đoàn 1."
    },
    {
      year: "9/1990 - 9/1993",
      title: "Thiếu tá, Học viên",
      description: "Học viện Lục quân."
    },
    {
      year: "10/1993 - 3/1994",
      title: "Thiếu tá, Trợ lý Tăng thiết giáp Sư đoàn",
      description: "Sư đoàn 312, Quân đoàn 1."
    },
    {
      year: "4/1994 - 3/1996",
      title: "Thiếu tá, Trợ lý Tác chiến Sư đoàn",
      description: "Phòng Tham mưu, Sư đoàn 312, Quân đoàn 1."
    },
    {
      year: "4/1996 - 8/1997",
      title: "Trung tá, Phó Tham mưu trưởng Trung đoàn",
      description: "Trung đoàn 141, Sư đoàn 312, Quân đoàn 1."
    },
    {
      year: "9/1997 - 9/1998",
      title: "Đảng ủy viên Trung đoàn, Trung tá, Phó Trung đoàn trưởng - Tham mưu trưởng",
      description: "Trung đoàn 209, Sư đoàn 312, Quân đoàn 1."
    },
    {
      year: "10/1998 - 6/1999",
      title: "Trung tá, Học viên",
      description: "Đại học Đại cương, Học viện Hậu cần."
    },
    {
      year: "12/1999 - 7/2001",
      title: "Phó Bí thư Đảng ủy Trung đoàn, Trung tá, Trung đoàn trưởng",
      description: "Trung đoàn 209, Sư đoàn 312, Quân đoàn 1."
    },
    {
      year: "9/2001 - 7/2002",
      title: "Thượng tá, Học viên",
      description: "Học viện Lục quân."
    },
    {
      year: "6/2003 - 10/2003",
      title: "Đảng ủy viên Sư đoàn, Thượng tá, Phó Sư đoàn trưởng - Tham mưu trưởng",
      description: "Sư đoàn 312, Quân đoàn 1."
    },
    {
      year: "11/2003 - 8/2006",
      title: "Phó Bí thư Đảng ủy Sư đoàn, Đại tá, Sư đoàn trưởng",
      description: "Sư đoàn 312, Quân đoàn 1."
    },
    {
      year: "9/2006 - 8/2007",
      title: "Đại tá, Học viên",
      description: "Học viện Quốc phòng."
    },
    {
      year: "9/2007 - 7/2008",
      title: "Phó Bí thư Đảng ủy Sư đoàn, Đại tá, Sư đoàn trưởng",
      description: "Sư đoàn 312, Quân đoàn 1."
    },
    {
      year: "8/2008 - 1/2009",
      title: "Đảng ủy viên Quân đoàn, Đại tá, Phó Tư lệnh về Quân sự Quân đoàn 1",
      description: "Quân đoàn 1."
    },
    {
      year: "2/2009 - 5/2010",
      title: "Đảng ủy viên Quân đoàn, Đại tá, Phó Tư lệnh kiêm Tham mưu trưởng Quân đoàn 1",
      description: "Quân đoàn 1."
    },
    {
      year: "6/2010 - 9/2011",
      title: "Thiếu tướng, Phó Bí thư Đảng ủy Quân đoàn, Tư lệnh Quân đoàn",
      description: "Quân đoàn 1"
    },
    {
      year: "10/2011 - 2/2014",
      title: "Trung tướng, Phó Tổng Tham mưu trưởng QĐNDVN",
      description: "Bộ Tổng tham mưu."
    },
    {
      year: "4/2016",
      title: "Trung tướng, Ủy viên Trung ương Đảng khóa XII, Thứ trưởng Bộ Quốc phòng",
      description: ""
    },
    {
      year: "5/2016 - 1/2021",
      title: "Thượng tướng, Ủy viên Trung ương Đảng khóa XII, Tổng Tham mưu trưởng QĐNDVN, Thứ trưởng Bộ Quốc phòng",
      description: ""
    },
    {
      year: "7/2021",
      title: "Đại tướng, Ủy viên Bộ Chính trị khóa XIII, XIV, Phó Bí thư Quân ủy Trung ương, Bộ trưởng Bộ Quốc phòng",
      description: ""
    }
  ]
}

/**
 * Nguyễn Tân Cương - Đại tướng, Tổng Tham mưu trưởng Quân đội nhân dân Việt Nam, Thứ trưởng Bộ Quốc phòng
 * Canonical LeaderProfile data following institutional military format
 */
export const nguyenTanCuongProfile: LeaderProfile = {
  id: "nguyen-tan-cuong",
  name: "Nguyễn Tân Cương",
  image: "/src/assets/dai-tuong-nguyen-tan-cuong.jpg",

  currentTitles: [
    "Ủy viên Trung ương Đảng",
    "Ủy viên Ban thường vụ Quân uỷ Trung ương",
    "Thứ trưởng Bộ Quốc phòng",
    "Tổng tham mưu trưởng Quân đội nhân dân Việt Nam",
  ],

  personalInfo: {
    fullName: "Nguyễn Tân Cương",
    birthDate: "12/2/1966",
    partyJoinDate: "28/01/1985",
    hometown: "Tỉnh Ninh Bình",
    positions: [
      "Ủy viên Trung ương Đảng: Khóa XI (dự khuyết), XII, XIII, XIV",
      "Ủy viên Ban Thường vụ Quân ủy Trung ương",
      "Đại tướng (từ 10/2024)",
      "Tổng Tham mưu trưởng Quân đội nhân dân Việt Nam (từ 6/2021)",
      "Thứ trưởng Bộ Quốc phòng (từ 12/2019)",
      "Đại biểu Quốc hội: Khóa XV"
    ],
    politicalTheoryLevel: "Cao cấp",
    professionalLevel: "Cử nhân Quân sự"
  },

  careerTimeline: [
    {
      year: "10/1983 - 6/1986",
      title: "Học viên",
      description: "Đại đội 3, Tiểu đoàn 3, Trường Sĩ quan Lục quân 2."
    },
    {
      year: "7/1986 - 9/1987",
      title: "Trung úy (từ 7/1986), Trung đội trưởng",
      description: "Tiểu đoàn 9, Trung đoàn 201, Sư đoàn 302, Mặt trận 479, Quân khu 7 (chiến đấu tại Campuchia)."
    },
    {
      year: "10/1987 - 8/1988",
      title: "Trung úy, Học viên",
      description: "Đào tạo Giáo viên Chiến thuật, trường Sĩ quan Lục quân 2."
    },
    {
      year: "9/1988 - 3/1989",
      title: "Trung úy, Thượng úy (từ 6/1988); Đại đội phó quân sự",
      description: "Đại đội 3, Tiểu đoàn 7, Trung đoàn 209, Sư đoàn 312, Quân đoàn 1; Chi ủy viên Chi bộ Đại đội."
    },
    {
      year: "4/1989 - 2/1991",
      title: "Thượng úy, Đại đội trưởng",
      description: "Đại đội 3, Tiểu đoàn 7 và Đại đội trưởng Đại đội 6, Tiểu đoàn 8, Trung đoàn 209, Sư đoàn 312, Quân đoàn 1; Phó Bí thư Chi bộ Đại đội."
    },
    {
      year: "3/1991 - 3/1992",
      title: "Thượng úy, Đại úy, Trợ lý Tác huấn",
      description: "Ban Tham mưu, Trung đoàn 209, Sư đoàn 312, Quân đoàn 1."
    },
    {
      year: "4/1992 - 3/1993",
      title: "Đại úy, Tiểu đoàn trưởng",
      description: "Tiểu đoàn 8, Trung đoàn 209, Sư đoàn 312, Quân đoàn 1."
    },
    {
      year: "4/1993 - 8/2000",
      title: "Đại úy, Thiếu tá, Trung tá, Trợ lý",
      description: "Phòng Quân huấn, Bộ Tham mưu, Quân đoàn 1. Học viên, Đào tạo chỉ huy TM BCHT cấp Trung đoàn, Học viện Lục quân (9/1996 - 7/1999)."
    },
    {
      year: "9/2000 - 5/2002",
      title: "Trung tá, Phó Trung đoàn trưởng, kiêm Tham mưu trưởng (4/2001 - 5/2002)",
      description: "Trung đoàn 141, Sư đoàn 312, Quân đoàn 1; Đảng ủy viên Đảng ủy Trung đoàn."
    },
    {
      year: "6/2002 - 10/2003",
      title: "Trung tá, Trung đoàn trưởng",
      description: "Trung đoàn 141, Sư đoàn 312, Quân đoàn 1; Phó Bí thư Đảng ủy Trung đoàn."
    },
    {
      year: "11/2003 - 11/2004",
      title: "Trung tá, Thượng tá; Trung đoàn trưởng",
      description: "Trung đoàn 165, Sư đoàn 312, Quân đoàn 1; Phó Bí thư Đảng ủy Trung đoàn."
    },
    {
      year: "12/2004 - 5/2007",
      title: "Thượng tá, Phó Tham mưu trưởng",
      description: "Sư đoàn 312, Quân đoàn 1; Đảng ủy viên Đảng ủy Phòng Tham mưu; Học viên, Đào tạo Chỉ huy TM BCHT cấp Sư đoàn, Học viện lục quân (9/2005 - 7/2006)."
    },
    {
      year: "6/2007 - 7/2008",
      title: "Thượng tá, Phó Sư đoàn trưởng về quân sự",
      description: "Sư đoàn 312, Quân đoàn 1; Đảng ủy viên Đảng ủy Sư đoàn."
    },
    {
      year: "8/2008 - 5/2010",
      title: "Thượng tá, Đại tá, Sư đoàn trưởng",
      description: "Sư đoàn 312, Quân đoàn 1; Phó Bí thư Đảng ủy Sư đoàn."
    },
    {
      year: "6/2010 - 9/2011",
      title: "Đại tá, Phó Tư lệnh kiêm Tham mưu trưởng",
      description: "Quân đoàn 1; Ủy viên dự khuyết Trung ương Đảng khóa XI (1/2011 - 1/2016); Ủy viên Thường vụ Đảng ủy Quân đoàn; Học viên, Đào tạo Chỉ huy TM BCHT cấp CD-CL, Học viện Quốc phòng (2/2011 - 1/2012)."
    },
    {
      year: "10/2011 - 3/2013",
      title: "Đại tá, Thiếu tướng, Tư lệnh Quân đoàn 1",
      description: "Phó Bí thư Đảng ủy Quân đoàn. Học viên, Bồi dưỡng Dự nguồn cán bộ cao cấp tại Học viện Chính trị Quốc gia Hồ Chí Minh (3 - 7/2013)."
    },
    {
      year: "4/2013 - 9/2014",
      title: "Thiếu tướng, Phó Tư lệnh kiêm Tham mưu trưởng (9/2013 - 9/2014)",
      description: "Quân khu 4; Đảng ủy viên Đảng ủy Quân khu (4/2013 - 8/2013), Ủy viên Thường vụ Đảng ủy Quân khu (9/2013 - 9/2014)."
    },
    {
      year: "10/2014 - 9/2018",
      title: "Thiếu tướng, Trung tướng, Tư lệnh Quân khu 4",
      description: "Ủy viên Trung ương Đảng khóa XII (từ 1/2016); Ủy viên Quân ủy Trung ương (từ 10/2014), Phó Bí thư Đảng ủy Quân khu."
    },
    {
      year: "10/2018 - 11/2019",
      title: "Ủy viên Trung ương Đảng khóa XII; Trung tướng, Phó Tổng tham mưu trưởng Quân đội Nhân dân Việt Nam",
      description: "Ủy viên Thường vụ Đảng ủy Bộ Tổng Tham mưu-Cơ quan Bộ Quốc phòng."
    },
    {
      year: "12/2019 - 1/2021",
      title: "Ủy viên Trung ương Đảng khóa XII; Trung tướng, Thượng tướng, Thứ trưởng Bộ Quốc phòng",
      description: "(từ 12/2019)."
    },
    {
      year: "1/2021 - 6/2021",
      title: "Ủy viên Trung ương Đảng khóa XIII; Thượng tướng, Thứ trưởng Bộ Quốc phòng",
      description: ""
    },
    {
      year: "6/2021",
      title: "Ủy viên Trung ương Đảng khóa XIII; Thượng tướng, Ủy viên Ban Thường vụ Quân ủy Trung ương, Tổng Tham mưu trưởng Quân đội nhân dân Việt Nam, Thứ trưởng Bộ Quốc phòng",
      description: "Đại biểu Quốc hội khóa XV (từ 7/2021)."
    },
    {
      year: "20/10/2024",
      title: "Đồng chí được thăng quân hàm Đại tướng",
      description: ""
    },
    {
      year: "31/8/2025",
      title: "Đồng chí được trao tặng Huân chương Quân công hạng Nhất",
      description: ""
    },
    {
      year: "22/1/2026",
      title: "Tại Đại hội đại biểu toàn quốc lần thứ XIV của Đảng, được bầu là Ủy viên Trung ương Đảng khóa XIV",
      description: ""
    }
  ]
}

/**
 * Nguyễn Trọng Nghĩa - Đại tướng, Chủ nhiệm Tổng cục Chính trị Quân đội nhân dân Việt Nam
 * Canonical LeaderProfile data following institutional military format
 */
export const nguyenTrongNghiaProfile: LeaderProfile = {
  id: "nguyen-trong-nghia",
  name: "Nguyễn Trọng Nghĩa",
  image: "/src/assets/dai-tuong-nguyen-trong-nghia.jpg",

  currentTitles: [
    "Ủy viên Bộ Chính trị",
    "Ủy viên Ban thường vụ Quân uỷ Trung ương",
    "Chủ nhiệm Tổng cục Chính trị Quân đội nhân dân Việt Nam"
  ],

  personalInfo: {
    fullName: "Nguyễn Trọng Nghĩa",
    birthDate: "6/3/1962",
    partyJoinDate: "28/08/1982",
    hometown: "Tỉnh Đồng Tháp",
    positions: [
      "Ủy viên Bộ Chính trị: Khóa XIII, XIV",
      "Bí thư Trung ương Đảng: Khóa XIII",
      "Ủy viên Trung ương Đảng: Khóa XII, XIII, XIV",
      "Ủy viên Ban Thường vụ Quân ủy Trung ương",
      "Đại tướng, Chủ nhiệm Tổng cục Chính trị Quân đội nhân dân Việt Nam (từ 11/2025)",
      "Ủy viên Hội đồng bầu cử quốc gia (từ 6/2025)",
      "Đại biểu Quốc hội: Khóa XIV, XV"
    ],
    politicalTheoryLevel: "Cao cấp",
    professionalLevel: "Cử nhân Khoa học xã hội và Nhân văn"
  },

  careerTimeline: [
    {
      year: "4/1979 - 6/1979",
      title: "Chiến sĩ",
      description: "Đại đội 2, Tiểu đoàn Ấp Bắc, Bộ Chỉ huy Quân sự tỉnh tiền Giang, Quân khu 9."
    },
    {
      year: "7/1979 - 10/1979",
      title: "Chiến sĩ",
      description: "Tiểu đoàn 4, Sư đoàn 441, Quân khu 4."
    },
    {
      year: "11/1979 - 3/1980",
      title: "Chiến sĩ",
      description: "Tiểu đoàn 5, Trung đoàn 5, Sư đoàn 320, Quân đoàn 3."
    },
    {
      year: "4/1980 - 7/1982",
      title: "Học viên",
      description: "trường Văn hóa Quân đoàn 3."
    },
    {
      year: "8/1982 - 6/1985",
      title: "Học viên",
      description: "trường Sĩ quan Chỉ huy-Kỹ thuật Thông tin."
    },
    {
      year: "7/1985 - 2/1986",
      title: "Trung úy, Trợ lý Chính trị",
      description: "Tiểu đoàn Huấn luyện, Lữ đoàn 596, Binh chủng Thông tin."
    },
    {
      year: "3/1986 - 11/1986",
      title: "Trung úy, Học viên",
      description: "trường Đảng Binh chủng Thông tin."
    },
    {
      year: "12/1986 - 9/1987",
      title: "Trung úy, Thượng úy, Giáo viên",
      description: "trường Sĩ quan Chỉ huy-Kỹ thuật Thông tin."
    },
    {
      year: "10/1987 - 9/1988",
      title: "Thượng úy, Trợ lý Huấn luyện; Phó Tiểu đoàn trưởng về Chính trị",
      description: "Tiểu đoàn 40, Trung đoàn Thông tin 23, Quân khu 7."
    },
    {
      year: "10/1988 - 8/1995",
      title: "Thượng úy, Đại úy, Thiếu tá Chủ nhiệm Chính trị",
      description: "Trung đoàn Thông tin 23, Quân khu 7; học tại chức chuyên ngành Triết học tại Đại học Tuyên giáo Trung ương (3/1989 - 1/1993)."
    },
    {
      year: "9/1995 - 8/2000",
      title: "Thiếu tá, Trung tá, Phó Trung đoàn trưởng về Chính trị",
      description: "Trung đoàn Thông tin 23, Quân khu 7; Bí thư Đảng ủy Trung đoàn 23; học tại chức chuyên ngành Quốc tế học tại trường Đại học Khoa học Xã hội và Nhân văn (7/1996 - 1/1999); học viên Học viện Chính trị, chuyên ngành Xây dựng Đảng và Chính quyền Nhà nước (11/1999 - 10/2000)."
    },
    {
      year: "9/2000 - 10/2007",
      title: "Trung tá, Thượng tá, Đại tá; Phó phòng, Trưởng phòng Tuyên huấn",
      description: "Cục Chính trị, Quân khu 7; Học viên Học viện Chính trị (10/2003 - 10/2004)."
    },
    {
      year: "11/2007 - 4/2008",
      title: "Đại tá, Phó Chính ủy Sư đoàn 5",
      description: "Quân khu 7; Đảng ủy viên Sư đoàn 5."
    },
    {
      year: "5/2008 - 9/2009",
      title: "Đại tá, Chính ủy Sư đoàn 5",
      description: "Quân khu 7; Bí thư Đảng ủy Sư đoàn 5."
    },
    {
      year: "10/2009 - 7/2010",
      title: "Đại tá, Phó Chủ nhiệm Chính trị",
      description: "Quân khu 7; Ủy viên Thường vụ Đảng ủy Cục Chính trị."
    },
    {
      year: "8/2010 - 8/2012",
      title: "Thiếu tướng, Chính ủy Quân đoàn 4",
      description: "Bí thư Đảng ủy Quân đoàn 4."
    },
    {
      year: "9/2012 - 8/2017",
      title: "Trung tướng, Phó Chủ nhiệm Tổng cục Chính trị Quân đội nhân dân Việt Nam",
      description: "Ủy viên Trung ương Đảng khóa XII (1/2016); Đại biểu Quốc hội khóa XIV; Ủy viên Đoàn Chủ tịch Ủy ban Trung ương Mặt trận Tổ quốc Việt Nam; Ủy viên Quân ủy Trung ương; Ủy viên Thường vụ Đảng ủy Cơ quan Tổng cục Chính trị."
    },
    {
      year: "9/2017 - 1/2021",
      title: "Ủy viên Trung ương Đảng khóa XII, Ủy viên Quân ủy Trung ương; Thượng tướng, Phó Chủ nhiệm Tổng cục Chính trị Quân đội nhân dân Việt Nam",
      description: "Ủy viên Hội đồng Lý luận Trung ương; Ủy viên Thường vụ Đảng ủy Cơ quan Tổng cục Chính trị; Đại biểu Quốc hội khóa XIV."
    },
    {
      year: "1/2021",
      title: "Tại Đại hội đại biểu toàn quốc lần thứ XIII của Đảng, được bầu vào Ban Chấp hành Trung ương và được Ban Chấp hành Trung ương bầu vào Ban Bí thư",
      description: ""
    },
    {
      year: "2/2021 - 5/2024",
      title: "Bí thư Trung ương Đảng khóa XIII, Trưởng Ban Tuyên giáo Trung ương",
      description: ""
    },
    {
      year: "7/2021",
      title: "Đại biểu Quốc hội khóa XV",
      description: ""
    },
    {
      year: "5/2024 - 2/2025",
      title: "Ủy viên Bộ Chính trị, Bí thư Trung ương Đảng khóa XIII, Trưởng Ban Tuyên giáo Trung ương",
      description: ""
    },
    {
      year: "2/2025 - 11/2025",
      title: "Ủy viên Bộ Chính trị, Bí thư Trung ương Đảng khóa XIII, Trưởng Ban Tuyên giáo và Dân vận Trung ương",
      description: "Ủy viên Hội đồng bầu cử quốc gia (6/2025)."
    },
    {
      year: "11/2025",
      title: "Ủy viên Bộ Chính trị, Bí thư Trung ương Đảng khóa XIII, Ủy viên Thường vụ Quân ủy Trung ương, Đại tướng, Chủ nhiệm Tổng cục Chính trị Quân đội nhân dân Việt Nam",
      description: "Ủy viên Hội đồng bầu cử quốc gia."
    },
    {
      year: "22/1/2026",
      title: "Tại Đại hội đại biểu toàn quốc lần thứ XIV của Đảng, được bầu là Ủy viên Trung ương Đảng khóa XIV, nhiệm kỳ 2026-2031",
      description: ""
    },
    {
      year: "23/1/2026",
      title: "Tại Hội nghị lần thứ nhất Ban Chấp hành Trung ương Đảng khóa XIV, được bầu vào Bộ Chính trị",
      description: ""
    }
  ]
}

/**
 * Export all leader profiles for easy import
 */
export const leaderProfiles = {
  phanVanGiang: phanVanGiangProfile,
  nguyenTanCuong: nguyenTanCuongProfile,
  nguyenTrongNghia: nguyenTrongNghiaProfile
}

/**
 * Helper function to get leader by ID
 */
export function getLeaderProfile(id: string): LeaderProfile | null {
  return leaderProfiles[id as keyof typeof leaderProfiles] || null
}
