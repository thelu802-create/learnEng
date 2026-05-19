import type { MosMockExam } from '../types'

export const wordMockExams: MosMockExam[] = [
  {
    id: 'word-mo110-mock-01',
    app: 'Word',
    code: 'MO-110-W01',
    title: 'Đề Word 01 - Báo cáo đào tạo nội bộ',
    difficulty: 'Trung bình',
    durationMinutes: 50,
    passingScore: 700,
    sourceNote:
      'Thiết kế theo outline MO-110 Microsoft Word (Microsoft 365 Apps): quản lý tài liệu, định dạng văn bản/đoạn/section, bảng/danh sách, tham chiếu, đồ họa và cộng tác.',
    scenario:
      'Bạn nhận một bản thảo báo cáo đào tạo nội bộ. Hãy chuẩn hóa tài liệu để gửi ban quản lý: bố cục rõ, bảng dữ liệu dễ đọc, mục lục tự động, hình minh họa có accessibility và bản cuối có thể in/xuất PDF.',
    starterFiles: ['training-report-draft.docx', 'training-photo.png', 'course-feedback.csv'],
    deliverables: ['training-report-final.docx', 'training-report-final.pdf'],
    tasks: [
      {
        id: 'w01-t01',
        skill: 'Manage documents',
        title: 'Thiết lập tài liệu và thuộc tính',
        instruction:
          'Đổi khổ giấy sang A4, đặt lề Moderate, thêm Title là "Internal Training Report" và Subject là "MOS Word readiness". Bật hiển thị formatting marks để kiểm tra khoảng trắng dư.',
        points: 10,
        checklist: [
          'Page setup đúng A4 và lề Moderate.',
          'Built-in document properties được cập nhật.',
          'Không còn khoảng trắng/dòng trống dư ở đầu tài liệu.',
        ],
      },
      {
        id: 'w01-t02',
        skill: 'Insert and format text, paragraphs, and sections',
        title: 'Chuẩn hóa heading và paragraph',
        instruction:
          'Áp dụng Heading 1 cho các mục chính, Heading 2 cho mục con. Đặt paragraph body text giãn dòng 1.15, spacing after 6 pt và first-line indent 0.5 inch.',
        points: 14,
        checklist: [
          'Heading dùng style built-in, không chỉ tô đậm thủ công.',
          'Body text có spacing/indent đồng nhất.',
          'Định dạng dư được clear trước khi áp style.',
        ],
      },
      {
        id: 'w01-t03',
        skill: 'Manage tables and lists',
        title: 'Chuyển feedback thành bảng',
        instruction:
          'Chuyển phần feedback dạng text/csv thành bảng 4 cột, sắp xếp theo cột Score giảm dần, bật header row lặp lại và căn giữa cột Score.',
        points: 16,
        checklist: [
          'Bảng đủ 4 cột và giữ đúng dữ liệu.',
          'Sort Score theo thứ tự giảm dần.',
          'Header row được đặt repeat across pages.',
        ],
      },
      {
        id: 'w01-t04',
        skill: 'Create and manage references',
        title: 'Tạo mục lục và footnote',
        instruction:
          'Chèn table of contents tự động sau trang bìa. Thêm footnote giải thích thuật ngữ "readiness score" ở lần xuất hiện đầu tiên, sau đó update toàn bộ fields.',
        points: 12,
        checklist: [
          'TOC lấy từ Heading styles và có số trang.',
          'Footnote nằm đúng thuật ngữ đầu tiên.',
          'Fields được update trước khi nộp.',
        ],
      },
      {
        id: 'w01-t05',
        skill: 'Insert and format graphic elements',
        title: 'Chèn ảnh minh họa có accessibility',
        instruction:
          'Chèn training-photo.png tại mục Summary, đặt wrap Square, width 3.2 inch, áp Picture Style đơn giản và thêm alt text mô tả nội dung ảnh.',
        points: 14,
        checklist: [
          'Ảnh đúng vị trí và không phá layout đoạn văn.',
          'Wrap/size đúng yêu cầu.',
          'Alt text mô tả rõ nội dung ảnh.',
        ],
      },
      {
        id: 'w01-t06',
        skill: 'Manage document collaboration',
        title: 'Xử lý comment và tracked changes',
        instruction:
          'Reply comment của reviewer ở phần Recommendations, resolve các comment đã xử lý, accept các thay đổi chính tả và reject thay đổi xóa mục Conclusion.',
        points: 14,
        checklist: [
          'Comment được reply/resolve đúng yêu cầu.',
          'Tracked changes được accept/reject có chọn lọc.',
          'Không còn markup ngoài yêu cầu cuối bài.',
        ],
      },
      {
        id: 'w01-t07',
        skill: 'Manage documents',
        title: 'Kiểm tra và xuất bản',
        instruction:
          'Chạy Accessibility Checker và Document Inspector cho bản cuối. Xử lý lỗi chính, sau đó export PDF chỉ gồm toàn bộ tài liệu đã hoàn thiện.',
        points: 20,
        checklist: [
          'Accessibility issues chính được xử lý.',
          'Hidden properties/personal information được kiểm tra.',
          'PDF xuất đúng tài liệu cuối cùng.',
        ],
      },
    ],
  },
  {
    id: 'word-mo110-mock-02',
    app: 'Word',
    code: 'MO-110-W02',
    title: 'Đề Word 02 - Newsletter nhiều cột',
    difficulty: 'Trung bình',
    durationMinutes: 50,
    passingScore: 700,
    sourceNote:
      'Đề mô phỏng workflow MO-110 cho newsletter, nhấn mạnh section breaks, multi-column text, text boxes, icons, lists và print/export.',
    scenario:
      'Bạn cần hoàn thiện newsletter hai trang cho một trung tâm đào tạo. Tài liệu phải có phần mở đầu nổi bật, nội dung chia cột, danh sách lịch học, hộp thông tin, hình/icon và bản in PDF.',
    starterFiles: ['newsletter-draft.docx', 'speaker-headshot.jpg', 'calendar-notes.txt'],
    deliverables: ['newsletter-final.docx', 'newsletter-print.pdf'],
    tasks: [
      {
        id: 'w02-t01',
        skill: 'Insert and format text, paragraphs, and sections',
        title: 'Tạo section newsletter',
        instruction:
          'Sau phần tiêu đề, chèn section break Continuous và định dạng phần body thành 2 cột có line between. Chèn column break để mục "Upcoming classes" bắt đầu ở đầu cột phải.',
        points: 16,
        checklist: [
          'Dùng section break đúng loại.',
          'Body newsletter có 2 cột và line between.',
          'Column break đặt đúng vị trí.',
        ],
      },
      {
        id: 'w02-t02',
        skill: 'Insert and format text, paragraphs, and sections',
        title: 'Find/replace và ký tự đặc biệt',
        instruction:
          'Dùng Find and Replace đổi toàn bộ "MS Office" thành "Microsoft 365". Chèn ký hiệu trademark sau lần xuất hiện đầu tiên của Microsoft 365.',
        points: 10,
        checklist: [
          'Replace đúng toàn bộ cụm cần đổi.',
          'Không đổi nhầm các từ ngoài yêu cầu.',
          'Ký hiệu đặc biệt được chèn đúng vị trí.',
        ],
      },
      {
        id: 'w02-t03',
        skill: 'Manage tables and lists',
        title: 'Tạo lịch học dạng bảng và danh sách',
        instruction:
          'Tạo bảng lịch học 3 cột từ calendar-notes.txt, merge hàng tiêu đề, áp table style có banded rows. Chuyển phần benefits thành bulleted list dùng ký tự bullet tùy chỉnh.',
        points: 18,
        checklist: [
          'Bảng đúng 3 cột và có hàng tiêu đề merge.',
          'Table style/banded rows rõ ràng.',
          'Bullet tùy chỉnh và list levels đúng.',
        ],
      },
      {
        id: 'w02-t04',
        skill: 'Insert and format graphic elements',
        title: 'Hình, icon và text box',
        instruction:
          'Chèn speaker-headshot.jpg vào phần Featured trainer, remove background nếu phù hợp, áp picture effect nhẹ. Chèn icon liên quan đến học tập và một text box callout cho ưu đãi đăng ký.',
        points: 18,
        checklist: [
          'Ảnh/icon/text box đúng vị trí.',
          'Graphic elements được format chuyên nghiệp.',
          'Text box không che nội dung chính.',
        ],
      },
      {
        id: 'w02-t05',
        skill: 'Manage documents',
        title: 'Header/footer và print settings',
        instruction:
          'Thêm header chứa tên trung tâm và footer có page number dạng Page X of Y. Kiểm tra Print Preview, đặt in 2-sided nếu môi trường hỗ trợ và export PDF.',
        points: 14,
        checklist: [
          'Header/footer đúng trên toàn tài liệu.',
          'Page number dùng field, không gõ tay.',
          'Print/export settings được kiểm tra.',
        ],
      },
      {
        id: 'w02-t06',
        skill: 'Create and manage references',
        title: 'Footnote nguồn thông tin',
        instruction:
          'Thêm footnote cho câu thống kê về tỷ lệ hoàn thành khóa học. Đổi numbering footnote sang restart each section nếu tài liệu có nhiều section.',
        points: 10,
        checklist: [
          'Footnote đúng câu thống kê.',
          'Footnote properties đúng yêu cầu.',
          'Số footnote hiển thị hợp lý sau khi update.',
        ],
      },
      {
        id: 'w02-t07',
        skill: 'Manage document collaboration',
        title: 'Review bản duyệt',
        instruction:
          'Bật Track Changes, sửa câu CTA cuối tài liệu, thêm một comment hỏi xác nhận hạn đăng ký, sau đó lưu tài liệu với markup còn hiển thị.',
        points: 14,
        checklist: [
          'Track Changes bật trước khi sửa CTA.',
          'Comment đặt đúng đoạn cần hỏi.',
          'Markup còn hiển thị trong file Word.',
        ],
      },
    ],
  },
  {
    id: 'word-mo110-mock-03',
    app: 'Word',
    code: 'MO-110-W03',
    title: 'Đề Word 03 - Chính sách làm việc hybrid',
    difficulty: 'Khó',
    durationMinutes: 50,
    passingScore: 700,
    sourceNote:
      'Đề mô phỏng MO-110 tập trung vào quản lý tài liệu dài, styles, section formatting, tables/lists, comments và xuất bản tài liệu chính sách.',
    scenario:
      'Bạn cần hoàn thiện tài liệu chính sách làm việc hybrid cho nhân sự mới. Tài liệu phải có trang bìa, heading nhất quán, bảng lịch làm việc, danh sách quy định, tham chiếu nội bộ và phần review đã xử lý.',
    starterFiles: ['hybrid-policy-draft.docx', 'work-schedule.xlsx', 'policy-review-notes.docx'],
    deliverables: ['hybrid-policy-final.docx', 'hybrid-policy-final.pdf'],
    tasks: [
      {
        id: 'w03-t01',
        skill: 'Manage documents',
        title: 'Tạo bản chính sách từ draft',
        instruction:
          'Lưu bản draft thành file mới với tên hybrid-policy-final.docx. Thêm Title, Author, Company và Tags phù hợp trong Document Properties. Đặt zoom/view để kiểm tra tài liệu ở Print Layout.',
        points: 12,
        checklist: [
          'File được lưu thành bản mới, không ghi đè draft.',
          'Document properties đủ Title, Author, Company, Tags.',
          'Tài liệu được kiểm tra ở Print Layout.',
        ],
      },
      {
        id: 'w03-t02',
        skill: 'Insert and format text, paragraphs, and sections',
        title: 'Trang bìa, styles và section',
        instruction:
          'Chèn cover page phù hợp, đổi tiêu đề tài liệu thành "Hybrid Work Policy". Áp Heading 1/Heading 2 cho toàn bộ mục, rồi chèn section break Next Page trước phần Appendix.',
        points: 16,
        checklist: [
          'Cover page có tiêu đề đúng.',
          'Heading dùng built-in styles và phân cấp đúng.',
          'Appendix bắt đầu ở section mới.',
        ],
      },
      {
        id: 'w03-t03',
        skill: 'Manage tables and lists',
        title: 'Bảng lịch làm việc và multilevel list',
        instruction:
          'Tạo bảng lịch làm việc từ work-schedule.xlsx hoặc dữ liệu được dán vào tài liệu. Áp table style nhẹ, autofit contents, sau đó chuyển phần Policy Rules thành multilevel list 1, 1.1, 1.1.1.',
        points: 18,
        checklist: [
          'Bảng đủ dữ liệu và dễ đọc.',
          'AutoFit/table style đúng, không vỡ trang.',
          'Multilevel list đánh số đúng cấp.',
        ],
      },
      {
        id: 'w03-t04',
        skill: 'Create and manage references',
        title: 'Bookmark, cross-reference và mục lục',
        instruction:
          'Tạo bookmark cho mục "Remote Work Eligibility". Chèn cross-reference tới mục này trong phần Introduction. Tạo table of contents tự động sau cover page và update fields.',
        points: 14,
        checklist: [
          'Bookmark đặt đúng mục.',
          'Cross-reference tự động, không gõ tay tiêu đề.',
          'TOC được update sau khi hoàn tất.',
        ],
      },
      {
        id: 'w03-t05',
        skill: 'Insert and format graphic elements',
        title: 'SmartArt quy trình phê duyệt',
        instruction:
          'Chèn SmartArt mô tả quy trình xin làm việc từ xa gồm 4 bước. Đổi màu SmartArt theo theme, căn giữa trong trang và thêm alt text mô tả quy trình.',
        points: 14,
        checklist: [
          'SmartArt đủ 4 bước theo nội dung.',
          'Màu/căn chỉnh đồng nhất với tài liệu.',
          'Alt text có mô tả hữu ích.',
        ],
      },
      {
        id: 'w03-t06',
        skill: 'Manage document collaboration',
        title: 'Xử lý nhận xét từ HR',
        instruction:
          'Mở policy-review-notes.docx hoặc phần comments có sẵn. Reply comment cần xác nhận, resolve comment đã xử lý và reject thay đổi xóa đoạn "Equipment Responsibility".',
        points: 14,
        checklist: [
          'Comment được reply/resolve đúng trạng thái.',
          'Thay đổi xóa đoạn quan trọng bị reject.',
          'Reviewing Pane không còn mục ngoài yêu cầu.',
        ],
      },
      {
        id: 'w03-t07',
        skill: 'Manage documents',
        title: 'Kiểm tra cuối và xuất PDF',
        instruction:
          'Chạy Spelling & Grammar, Accessibility Checker và Inspect Document. Sửa lỗi chính, giữ nguyên nội dung chính sách, rồi export toàn bộ tài liệu sang PDF.',
        points: 12,
        checklist: [
          'Lỗi chính tả/ngữ pháp rõ ràng được xử lý.',
          'Accessibility issue chính được sửa.',
          'PDF xuất từ bản final đúng nội dung.',
        ],
      },
    ],
  },
  {
    id: 'word-mo110-mock-04',
    app: 'Word',
    code: 'MO-110-W04',
    title: 'Đề Word 04 - Proposal khóa học doanh nghiệp',
    difficulty: 'Khó',
    durationMinutes: 50,
    passingScore: 700,
    sourceNote:
      'Đề mô phỏng MO-110 theo tình huống proposal: document setup, reusable styles, table pricing, citations/captions, images và review workflow.',
    scenario:
      'Bạn đang hoàn thiện proposal đào tạo Microsoft 365 cho khách hàng doanh nghiệp. Tài liệu cần trình bày chuyên nghiệp, có bảng báo giá, hình minh họa, caption, citation và bản PDF để gửi khách hàng.',
    starterFiles: ['enterprise-proposal-draft.docx', 'training-room.jpg', 'pricing-table.txt', 'source-list.xml'],
    deliverables: ['enterprise-proposal-final.docx', 'enterprise-proposal-client.pdf'],
    tasks: [
      {
        id: 'w04-t01',
        skill: 'Manage documents',
        title: 'Template, theme và save options',
        instruction:
          'Lưu proposal thành file mới. Áp theme phù hợp với tài liệu doanh nghiệp, kiểm tra AutoSave/AutoRecover settings nếu có thể và thêm Category là "Client proposal".',
        points: 10,
        checklist: [
          'File final được lưu riêng.',
          'Theme áp dụng đồng nhất toàn tài liệu.',
          'Category/properties được cập nhật.',
        ],
      },
      {
        id: 'w04-t02',
        skill: 'Insert and format text, paragraphs, and sections',
        title: 'Định dạng proposal theo section',
        instruction:
          'Tạo section riêng cho Executive Summary, Scope, Pricing và Appendix. Đặt header khác cho trang đầu, canh paragraph body justified, spacing after 6 pt.',
        points: 15,
        checklist: [
          'Các section chính được tách đúng.',
          'Different First Page header hoạt động đúng.',
          'Body paragraph nhất quán spacing/alignment.',
        ],
      },
      {
        id: 'w04-t03',
        skill: 'Manage tables and lists',
        title: 'Bảng báo giá và danh sách deliverables',
        instruction:
          'Chuyển pricing-table.txt thành bảng báo giá, format cột tiền tệ, sort theo Package từ Basic đến Premium. Chuyển deliverables thành numbered list và restart numbering ở Appendix.',
        points: 18,
        checklist: [
          'Bảng báo giá đúng dữ liệu và format tiền tệ.',
          'Sort theo thứ tự package yêu cầu.',
          'Numbered list restart đúng vị trí.',
        ],
      },
      {
        id: 'w04-t04',
        skill: 'Create and manage references',
        title: 'Citation, bibliography và caption',
        instruction:
          'Import hoặc tạo citation cho nguồn Microsoft Learn. Chèn citation vào đoạn nói về MOS objectives, tạo bibliography cuối tài liệu và thêm caption cho hình training-room.jpg.',
        points: 15,
        checklist: [
          'Citation được chèn bằng công cụ References.',
          'Bibliography tự động hiển thị cuối tài liệu.',
          'Caption hình dùng label Figure và số tự động.',
        ],
      },
      {
        id: 'w04-t05',
        skill: 'Insert and format graphic elements',
        title: 'Ảnh phòng đào tạo và shape callout',
        instruction:
          'Chèn training-room.jpg vào Scope, crop theo tỉ lệ 16:9, wrap Top and Bottom. Thêm shape callout ghi "Hands-on MOS practice" và group với ảnh nếu phù hợp.',
        points: 15,
        checklist: [
          'Ảnh crop đúng và nằm trong Scope.',
          'Wrapping không làm trôi nội dung.',
          'Callout rõ ràng, không che thông tin quan trọng.',
        ],
      },
      {
        id: 'w04-t06',
        skill: 'Manage document collaboration',
        title: 'So sánh và review proposal',
        instruction:
          'Dùng Compare nếu có bản previous draft, kiểm tra các thay đổi. Accept thay đổi format, reject thay đổi tăng giá Premium nếu không được duyệt, và thêm comment nhắc xác nhận ngày triển khai.',
        points: 14,
        checklist: [
          'Compare/review được dùng đúng mục đích.',
          'Accept/reject có chọn lọc theo yêu cầu.',
          'Comment xác nhận ngày triển khai đúng vị trí.',
        ],
      },
      {
        id: 'w04-t07',
        skill: 'Manage documents',
        title: 'Chuẩn bị gửi khách hàng',
        instruction:
          'Chạy Accessibility Checker, update TOC/fields/captions, kiểm tra Print Preview và export PDF đặt tên enterprise-proposal-client.pdf.',
        points: 13,
        checklist: [
          'TOC, bibliography, captions, fields đều được update.',
          'Print Preview không có trang trắng ngoài ý muốn.',
          'PDF đúng tên và đúng bản cuối.',
        ],
      },
    ],
  },
  {
    id: 'word-mo110-mock-05',
    app: 'Word',
    code: 'MO-110-W05',
    title: 'Đề Word 05 - Sổ tay onboarding nhân viên',
    difficulty: 'Trung bình',
    durationMinutes: 50,
    passingScore: 700,
    sourceNote:
      'Đề mô phỏng MO-110 cho tài liệu handbook: navigation pane, styles, tables, lists, references, icons/pictures, accessibility và track changes.',
    scenario:
      'Bạn cần hoàn thiện sổ tay onboarding cho nhân viên mới. File hiện có nhiều đoạn chưa chuẩn, danh sách bị lỗi numbering, hình thiếu alt text và reviewer đã để lại một số thay đổi cần xử lý.',
    starterFiles: ['onboarding-handbook-draft.docx', 'office-map.png', 'benefits-data.csv'],
    deliverables: ['onboarding-handbook-final.docx', 'onboarding-handbook-print.pdf'],
    tasks: [
      {
        id: 'w05-t01',
        skill: 'Manage documents',
        title: 'Điều hướng và tổ chức file',
        instruction:
          'Bật Navigation Pane, tìm mục "First week checklist" và di chuyển mục này lên trước "Tools and access". Thêm custom property Department với giá trị "People Operations".',
        points: 12,
        checklist: [
          'Navigation Pane được dùng để kiểm tra cấu trúc.',
          'Mục First week checklist nằm đúng vị trí mới.',
          'Custom property Department được thêm đúng.',
        ],
      },
      {
        id: 'w05-t02',
        skill: 'Insert and format text, paragraphs, and sections',
        title: 'Sửa styles và spacing toàn sổ tay',
        instruction:
          'Modify style Normal thành font 11 pt, line spacing 1.15. Modify Heading 1 có màu theo theme và spacing before 12 pt. Áp style đúng cho các heading bị format thủ công.',
        points: 16,
        checklist: [
          'Modify style, không chỉnh từng đoạn riêng lẻ.',
          'Heading bị format thủ công được áp lại style.',
          'Spacing sau khi sửa đồng đều.',
        ],
      },
      {
        id: 'w05-t03',
        skill: 'Manage tables and lists',
        title: 'Bảng phúc lợi và checklist onboarding',
        instruction:
          'Import benefits-data.csv thành bảng, bật total row nếu phù hợp, sort theo Eligibility. Sửa checklist onboarding thành checkbox list hoặc bullet list nhất quán.',
        points: 17,
        checklist: [
          'CSV vào bảng đúng cột.',
          'Sort Eligibility đúng yêu cầu.',
          'Checklist có bullet/checkbox nhất quán.',
        ],
      },
      {
        id: 'w05-t04',
        skill: 'Create and manage references',
        title: 'Index entry và hyperlink nội bộ',
        instruction:
          'Đánh dấu index entry cho các thuật ngữ "probation", "benefits" và "security badge". Chèn hyperlink nội bộ từ phần Welcome tới mục First week checklist.',
        points: 12,
        checklist: [
          'Index entries được mark đúng thuật ngữ.',
          'Hyperlink nội bộ nhảy tới đúng mục.',
          'Không gõ tay đường dẫn hoặc số trang.',
        ],
      },
      {
        id: 'w05-t05',
        skill: 'Insert and format graphic elements',
        title: 'Office map và icon accessibility',
        instruction:
          'Chèn office-map.png vào phần Office guide, đặt width 5 inch, wrap Tight. Chèn 3 icon đại diện cho HR, IT, Security, căn đều và thêm alt text cho từng graphic.',
        points: 18,
        checklist: [
          'Office map đúng kích thước và wrap.',
          '3 icon được căn đều.',
          'Tất cả graphic có alt text hữu ích.',
        ],
      },
      {
        id: 'w05-t06',
        skill: 'Manage document collaboration',
        title: 'Track changes cho bản sổ tay',
        instruction:
          'Accept các thay đổi sửa chính tả, reject thay đổi xóa mục Security. Thêm comment tại mục IT access yêu cầu xác nhận link đăng nhập mới.',
        points: 13,
        checklist: [
          'Accept/reject đúng từng loại thay đổi.',
          'Mục Security vẫn còn trong tài liệu.',
          'Comment đặt đúng mục IT access.',
        ],
      },
      {
        id: 'w05-t07',
        skill: 'Manage documents',
        title: 'Hoàn thiện bản in',
        instruction:
          'Update toàn bộ fields, tạo PDF bản in. Đảm bảo tài liệu không còn text ẩn ngoài ý muốn và footer có page number tự động.',
        points: 12,
        checklist: [
          'Fields/index/hyperlink được update/kiểm tra.',
          'Không còn hidden text ngoài ý muốn.',
          'Footer page number dùng field tự động.',
        ],
      },
    ],
  },
]

export const mosWordSkillWeights = [
  { skill: 'Manage documents', weight: '20-25%' },
  { skill: 'Insert and format text, paragraphs, and sections', weight: '20-25%' },
  { skill: 'Manage tables and lists', weight: '20-25%' },
  { skill: 'Create and manage references', weight: '5-10%' },
  { skill: 'Insert and format graphic elements', weight: '15-20%' },
  { skill: 'Manage document collaboration', weight: '5-10%' },
] as const
