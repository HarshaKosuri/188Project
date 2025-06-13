# Beezy | Make Focus Intentional

## UCLA CS 188 - Members:  Armeen, Harsha, Madhavi

### **Introduction**

#### **Motivation**

Laptop users often begin their sessions with strong intentions, like finishing an assignment, completing a work task, or studying for an exam. However, they frequently find themselves sidetracked, not by dramatic interruptions, but by invisible patterns of multitasking, passive browsing, and low-level distractions. These shifts often go unnoticed in the moment: a quick glance at YouTube turns into a 30-minute detour, or a background tab starts autoplaying unrelated content. Over time, this results in a widening gap between what users set out to do and what they actually accomplish. While some users employ strategies like organizing tabs or silencing notifications, many of these tactics fall short because they fail to address the subtle, habitual attention shifts that fragment focus. This mismatch between intention and behavior creates frustration, increases cognitive fatigue, and diminishes overall productivity. To create a healthier and more sustainable relationship with digital workspaces, users need tools that offer awareness without judgment by supporting them in understanding how their attention is being spent and empowering them to self-regulate in real time.

#### **Problem Statement**

Laptop-based work is increasingly vulnerable to unseen attention loss. These come in the form of quiet, unconscious tab switching and algorithmic drifts, rather than loud notifications. While users are often aware of major distractions, they rarely recognize the smaller, gradual shifts in attention that silently break their focus and reduce their effectiveness. The challenge is that current productivity tools tend to either over-simplify distraction (e.g., by blocking certain websites) or fail to reflect a user’s specific goals and behavior patterns. As a result, users are left without the means to detect or respond to these subtle interruptions, making it difficult to stay intentionally engaged with their tasks. Our project addresses this critical gap by identifying the hidden behavioral patterns that lead to fragmented work and designing an intelligent system that highlights these moments to the user in real time. By offering tailored, supportive feedback and actionable insights, we aim to help users reflect, refocus, and build long-term good habits on their own accord. 

### **User Research**

#### **Key Findings**

When we set out to design Beezy, we began with a core hypothesis: *Laptop users are distracted by hidden patterns of multitasking and attention shifts they don’t notice.* 

While traditional productivity tools often aim to reduce screen time or block distracting websites, we believed the real issue was more nuanced as attention is not just interrupted by loud distractions but quietly fragmented by subtle, habitual behaviors users may not even be aware of. To explore this, we conducted a series of user interviews focused on how people use their laptops throughout the day. We wanted to know: *What kinds of tasks do users juggle? What disrupts their focus? And how do they experience productivity—both when it’s working, and when it’s not?*

We approached our research with two complementary methods:

1. *Semi-Structured Interviews*  
   Participants walked us through a typical day on their laptop. Instead of asking just for task lists, we encouraged them to reflect: When did you feel distracted? Did you notice yourself switching tabs? Did you attempt any strategies to stay focused?  
     
2. *Synthesis and Theme Mapping*  
   After gathering stories from across participants, we mapped recurring behaviors, focus breakdowns, and patterns in how people attempt (and often fail) to manage their attention online.

Our casual, end-of-day interview style helped participants speak naturally about their behaviors, giving us insight into not just what they did, but how they felt as their focus drifted or faltered.

Two participants, Sofia and Tega, stood out as good examples of the broader focus challenges users face.

* *Sofia: The Overwhelmed Multitasker*  
  Sofia is an undergraduate student who sets out to complete an assignment but quickly finds herself overwhelmed by the digital chaos of her laptop. With tabs open for school platforms, Google Docs, YouTube, shopping, and group chats, her attention continually splits before she realizes it. She may write a few sentences before checking a notification, watching a video “for just a second,” or switching to a different task altogether. Even though she has good intentions, Sofia struggles to notice just how often her attention shifts. She reports feeling increasingly anxious as time passes without meaningful progress. Her problem isn’t a lack of effort—it’s that the tools around her make it easy to lose track of her focus without noticing.  
    
* *Tega: The Strategic Multitasker*  
  Tega, also a student, approaches laptop work with more structure. He often combines light work (like answering emails or organizing files) with entertainment (like listening to a podcast or playing a video in the background). This multitasking is often intentional—but it’s still risky. When YouTube’s autoplay suggests something new, or a message pops up mid-task, he’s drawn away, subtly and repeatedly. Even though Tega is usually productive, he recognizes that his attention is gradually eroded over time. His energy wanes, and small distractions eventually add up.  

From Sofia, Tega, and other participants, we mapped out two contrasting, but equally important session types:

* *Fragmented Work Sessions*   These sessions are characterized by frequent task switching, often triggered by external notifications or internal impulses to check in “just for a second.” Sofia’s sessions often become fragmented quickly: she opens her laptop with a clear goal, but unintentional multitasking derails her. Tega, while more structured, also finds his sessions breaking down over time due to cumulative distractions.

  ![Screen Shot 2025-04-26 at 3 58 21 PM](https://github.com/user-attachments/assets/7670e676-e66c-4871-ab21-00d173123cad)

Figure 2\. Fragmented Session Workflow

*  *Focused Work Sessions*   Both Sofia and Tega are capable of deep focus, especially when deadlines loom. However, these focused sessions tend to be exceptions, not the norm. Sofia finds it hard to create the right conditions to replicate her “deadline mode.” Tega maintains a higher baseline of focus, but even he isn’t immune to quiet attention drifts.

   ![Screen Shot 2025-04-26 at 4 04 39 PM](https://github.com/user-attachments/assets/e0dd7f0c-abc7-49cb-9f73-5385ac939314)

Figure 3\. Focused Session Workflow 

These patterns show that productive work isn’t just about blocking distractions, but about *surfacing the hidden ways attention shifts* so users can manage them better.

Across all participants, four recurring challenges emerged:

1. *Managing Divided Attention*	  
   Many users start a session with a clear goal, only to open multiple tabs and apps that fragment their focus. What begins as multitasking quickly devolves into scattered activity.

2. *Navigating Distraction Triggers*  
   Notifications, algorithm-driven content (like YouTube or TikTok), and background messaging apps act as low-level distractions that continuously interrupt momentum.  
     
3. *Recognizing Hidden Patterns of Time Loss*  
   Most users had difficulty recalling how they lost time during a session. Small interruptions rarely register as disruptive in the moment, but cumulatively they drain focus. This invisibility makes reflection and behavior change difficult.  
     
4. *Balancing Multitasking and Deep Work*  
   Some multitasking is intentional, but few users had a clear strategy to shift between types of work without losing track of time or purpose. Even structured sessions (like Tega’s) were vulnerable to drift over longer periods.

Ultimately, our research highlights a central idea: Laptop distractions are often invisible. They aren’t just loud pings or sudden interruptions; they’re the quiet moments where attention drifts without notice. Whether users are chaotic like Sofia or structured like Tega, they all face the challenge of managing digital environments designed to split their attention. The solution isn’t simply to reduce screen time or block sites. It’s to build systems, like Beezy, that help users see their attention patterns, reflect on their goals, and regain control over their focus, one session at a time.

#### **Design Goals**

1. *Empower through Self-Awareness, not Enforcement*  
   Our primary goal is to support users by spreading awareness rather than imposing control. We aim to create a tool that helps users reflect on their online habits without feeling judged or micromanaged. Instead of blocking websites or enforcing rigid rules, Beezy uses gentle nudges and reflective notifications to help users notice when they’re drifting off track. This approach respects user autonomy while acknowledging the frustration people feel when they lose focus and fall behind.  
2. *Make Feedback Timely & Contextual*  
   Beezy provides real-time support during moments of distraction, but in a way that’s friendly, non-intrusive, and encouraging. Our goal is to guide users back to their goals without disrupting their workflow. For example, subtle on-screen interactions from the bee character can appear after periods of inactivity, visits to distracting sites, or long sessions of productive work. This ensures feedback feels integrated into the user’s context and mindset.  
3. *Personalized Visual Feedback*  
   Reflection is most effective when it’s personal and visual. Beezy offers clear and engaging summaries that show users how their time was spent, with breakdowns tailored to individual work patterns and preferences. Whether it’s tracking progress toward a goal, identifying trends in focus, or comparing daily behaviors, the visual feedback is designed to be meaningful and motivating. By layering in elements like the analysis dropdown and pie chart, users can engage better with their own data to build insights over time.  
4. *User Control & Flexibility*  
   We believe that focus tools should adapt to users –not the other way around. Beezy is designed to be customizable, allowing users to define their own focus and distraction zones. For instance, users can write which websites they personally consider unproductive rather than relying on a fixed blacklist while entering their goals for the session. They can also control when to receive nudges and when to start a new work session. This flexibility supports a wide range of work styles and helps users take ownership of their productivity journey.

---

### **System Design & Implementation**

#### **Work Session Kickoff**

Once Beezy is activated, users are immediately prompted to set an intention for their work session by entering a specific goal. This step serves two key purposes: it fosters a mindset of focus and accountability, and it provides the system with personalized context to evaluate activity throughout the session. Whether the goal is broad (e.g., “Work on homework”) or highly specific (e.g., “Finish my computer science research paper” as shown below), the input helps frame the upcoming session as purposeful. This design choice reflects our belief that productivity isn’t just about time management, but about pairing time with intention. By encouraging users to articulate what they’re trying to accomplish, Beezy makes each session more customized and helps users be more aware of when they’re diverging from their own goals. 

Technically, the goal input is stored locally and timestamped to mark the start of a session. This data becomes the base for Beezy’s session-based tracking system, which monitors site activity, tab switching, and engagement levels. Later, these are compared against the user’s declared goal to generate a productivity summary. In future iterations, we plan to allow users to categorize their goals (e.g., writing, studying, coding), which would further personalize the visual feedback and tracking metrics. This goal-setting interface is deliberately minimal and open-ended to allow for users to add as much or as little detail in their work sessions as they’d like.

![image](https://github.com/user-attachments/assets/a2582c7d-8c98-4813-bf50-ed850603e49a)

Figure 4\. Beezy’s Goal Tracking Prompt

#### **Smart Monitoring**

Once a user sets their goal, Beezy transitions into observation mode, quietly and efficiently tracking their activity in the background without disrupting the workflow. This monitoring is the basis of Beezy’s ability to provide personalized feedback and productivity insights.

The system keeps track of several key behavioral metrics during a session:

* *Total session duration* — how long the user has been actively working since the goal was set  
* *Number of open tabs* — an indicator of potential multitasking or distraction  
* *Number of tab switches* — often correlated with attention shifts or task-switching behavior  
* *Sites visited* — a record of websites accessed, allowing Beezy to find productivity patterns  
* *Time spent per site* — offering insight into where the user's attention goes

These metrics are updated every 10 seconds using Chrome’s extension APIs, allowing Beezy to maintain an accurate and responsive picture of the user’s browsing behavior. This lightweight monitoring approach minimizes performance impact while still capturing meaningful data. It also ensures that users are never blindsided by long periods of unfocused behavior since they can always check in on themselves at any point. Importantly, Beezy’s design emphasizes transparency and user control. Users can view their live session data at any time by clicking the extension icon, which opens a snapshot of their current progress and activity breakdown. In contrast to apps that monitor or punish, Beezy's approach allows users to stay aware, take ownership of their behavior, and make self-directed adjustments. In future versions, we hope to have smarter insights such as detecting behavioral trends over time or suggesting custom nudges based on typical tab-switching habits or frequently visited sites.

#### **AI-Powered Productivity Scoring**

Beezy is especially unique because it doesn’t just track activity, but interprets it. Beezy’s intelligent feedback system is centered around its AI-powered productivity scoring, which uses a large language model (ChatGPT-3.5) to make contextual judgments about user activity in real time. Every time the user switches to a new tab, Beezy initiates a classification process. It passes two key pieces of information to the language model:

1. The URL of the active website  
2. The goal the user entered at the start of the session

This information is fed into a customized prompt that asks the LLM whether the content of the site supports or detracts from the user-defined goal stated previously. For example, if a user’s goal is “Finish my computer science research paper” and they navigate to a Stack Overflow page, the model is likely to return a productive label. However, if they visit a shopping site or start scrolling social media, the model will likely classify it as unproductive.

This classification is stored locally and used to populate a detailed analytics dashboard. The dashboard includes:

* A real-time *pie chart* dividing time into productive (green) vs. unproductive (red) categories, giving users a quick visual grasp of their session.  
* *Hover-enabled tool* that shows exact time spent, percentages, and productivity classification per category.  
* A *scrollable list* of visited websites, each paired with a time bar that reflects both duration and productivity through color-coding and scaling.  
* A *session productivity score*, dynamically calculated based on the ratio of time spent on helpful versus distracting sites, providing a single number that summarizes focus quality.

This scoring system transforms passive data into goal-focused insights. Instead of relying on rigid blacklists or generalized assumptions about productivity, Beezy adapts to each user's purpose at the moment. It provides a layer of intelligent interpretation that helps users recognize behavior patterns and evaluate how well they’re sticking to their own intentions. Therefore, in Beezy, AI serves as a neutral assistant to flag helpful patterns, offer reflection points, and encourage mindfulness through visibility instead of control.

![Screenshot 2025-06-09 203742](https://github.com/user-attachments/assets/bf6858d1-d741-4052-819e-283f2968692c)

Figure 5\. Beezy Analytics Opened on Chrome

#### **Smart Notifications**

To support users in staying mindful and on-task, Beezy features a system of smart, context-aware notifications. Rather than relying on harsh interruptions or rigid timers, Beezy delivers gentle nudges tailored to each user’s goals and behavior patterns. These notifications are designed to feel more like a helpful friend than a disciplinarian by being encouraging, reflective, and personalized.

1. *Tab Switches*

   Each time a user switches tabs, Beezy evaluates the new site in real-time. If the site is determined to be unproductive in relation to the user’s stated goal, Beezy issues a notification:

![image (3)](https://github.com/user-attachments/assets/71909712-cfa5-428a-bcfe-5ec5ac2f7e37)

Figure 6\. Tab Switch Notification

This message is generated dynamically by a language model (LLM) using the user’s own goal to ensure relevance. By using natural, supportive phrasing, Beezy keeps the tone constructive while prompting self-correction. These alerts are also persistent, meaning users must actively dismiss them, encouraging users to reflect and take action in the moment to shift back focus.

2. *Persistent Reminders*  
     
   If a user remains on unproductive websites for five continuous minutes, Beezy sends a follow-up notification to gently break the cycle of distraction. This secondary reminder is meant to help users recognize when a short lapse in focus has turned into a longer detour. It serves as a subtle checkpoint, not a punishment, to remind users of their original intention and nudge them to correct their focus without guilt or shame.  
   

![image (1)](https://github.com/user-attachments/assets/6fc51a4c-1021-4a2a-8d9b-9e4ac4b26a7a)

Figure 7\. Unproductive Site Notification

3. *Positive Reinforcement*  
   If a user stays on productive websites for 30 minutes continuously, Beezy rewards their focus with a congratulatory notification such as:

![image (2)](https://github.com/user-attachments/assets/57805369-44b6-45da-8f40-68e78d1c3587)

Figure 8\. Productive Site Notification

These encouraging messages use positive reinforcement to motivate sustained concentration. The aim is to promote good habits by recognizing them in the moment, creating a sense of accomplishment and momentum for users.

Each notification type is carefully timed and designed to feel relevant, supportive, and non-intrusive. In future versions, we plan to offer settings that allow users to customize notification frequency, tone, or even write their own encouragement messages to give them more ownership of how they engage with Beezy.

#### **User Control**

A core idea behind Beezy is that users should remain in charge of their own productivity journey. While the system offers intelligent feedback and helpful nudges, it never takes full control over a user’s workflow. Beezy serves as a helpful friend, not a controller.

Hence, Beezy includes several features that put control back into the hands of the user:

* *Pause Tracking* – At any point, users can choose to pause Beezy’s tracking. This is especially useful during breaks, spontaneous interruptions, or when switching to offline tasks. By pausing tracking, users ensure their productivity score reflects only intentional screen time, not moments when they were pulled away. This feature respects the fluid nature of real-world work and helps maintain the integrity of Beezy’s feedback.  
* *Clear Session Data* – Beezy allows users to clear their current session data and begin a new one. This is particularly helpful when transitioning between tasks or when users want to reset after a period of unproductivity. Starting clean gives users a renewed sense of focus and removes the pressure of past metrics with a new session.

These features are easily accessible from the extension UI and designed to feel empowering rather than hidden behind technical settings. Together, they ensure that Beezy remains adaptable to different work styles and rhythms, like whether a user prefers short, focused sprints or long, uninterrupted work sessions. Looking ahead, we plan to expand user controls even further, potentially allowing for goal presets, custom productivity thresholds, and adjustable nudging sensitivity. 

---

### **User Evaluation**

#### **Evaluation Question**

*“Does our extension help users become more mindful of their computer usage and respond to notifications that alert them if they are off-task?”*

#### **Methods**

In order to properly gather data to evaluate our system, we conducted user testing with students at UCLA to see if the extension allowed them to properly see their usage and if the notifications helped them understand when they were being off task or not. This was very helpful. Additionally, we asked them how they felt using it and if the UI/UX was intuitive for them to use. This was based on the feedback we received, we understood that the strongest reason to use this extension would be ensuring the interaction with the extension was seamless and that it wasn’t taking away from any current experience, so a large emphasis was focused on how the user felt using the extension.

#### **Analysis**

After user testing, we used a qualitative analysis to understand how users felt after using the extension and if it was able to give them insight about their computer usage or how they felt using the extension and if the notifications were occurring at the right time. Based on this we were able to categorize the responses and see if the extension was able to build upon the user’s current experience using their computer.

![Graph1](https://github.com/user-attachments/assets/3dd8efdd-3f52-434a-bf4d-0b9106bc30d3)
  
Figure 9\. Key User Insights from Beezy Evaluation & Interviews

![Graph2 (1)](https://github.com/user-attachments/assets/8556c219-982e-4695-a1c9-e1d9bda5bd38)
  
Figure 10\. User-Perceived Usefulness of Beezy Features

![Graph3](https://github.com/user-attachments/assets/cab19361-b395-4708-8c4f-7dfb9486da58)

Figure 11\. User Emotional Responses During Beezy Evaluation

#### **Findings**

After analysis, we found that the extension was really helpful with letting people know how they spent time on their laptop, the dropdown menu and the analysis/understanding of what was deemed productive and unproductive was also very helpful. The notifications were also accurate, due to the prompting system on the backend of the extension that allowed the extension to accurately label most of the websites visited. Therefore, the qualitative analysis did show that the extension was a helpful addition to most workflows. An issue that did come up was when the workflows ended up having multiple apps. Because the extension currently just focuses on a user’s chrome usage, when a person goes off chrome to an app like messages for example, the extension doesn’t be as useful. Additionally, if the user is doing something like coding on an IDE, the extension was not able to track any of that data accurately. However, the findings did show that if the workflow was limited to chrome usage, that the extension was helpful.

---

### **Conclusion**

#### **Limitations**

The main limitation of our extension is its inability to properly track activity across applications beyond the web browser. As a result, its effectiveness is constrained for users, especially students whose workflows involve non-browser based tools such as coding environments or other desktop applications. This limits the extension’s ability to provide a complete picture of the user’s activity and impacts the extension's main goal of supporting broader productivity habits. I think this could definitely be improved by figuring out a way to basically allow the extension to be able to track user data throughout different extensions. Then, all the different workflows would be able to be represented as needed. Another limitation that we also faced was that as of now, the most readily available user data we had was mainly students at UCLA. With a lot of users having common factors, it makes it much harder to know features we could expand upon and what features are working great on a large scale. If we had access to other schools, we could collect more data on features and inputs on how to improve our product.

#### **Future Work**

I think an excited prospect of this extension is the positive feedback that was received when the extension was just focused on web browsing, and how that can be expanded to computer-wide use. This would be something to explore in the future, as it would be able to give the full picture of a user’s productivity needs and make users be more mindful about their workflows. This would also make the extension naturally evolve from something that isn’t limited to chrome to a full-fledged app that would be able to run on different devices and be able to track data across those platforms.

#### **Lesson Learned**

One of the most important lessons we learned from building this application is the critical role of UI design in productivity tools. While many other productivity apps are able to offer similar core functionalities, what is able to truly set them apart is the quality of their UI and differences in interactive flows. We came to understand that even small differences in usability and visual design can significantly impact user engagement and perceived effectiveness. Additionally, we also learned how important user testing was. In other classes, user input is important but only to an extent. The class allowed us to understand how much it mattered, and because of that, we were able to iterate very quickly by constantly testing our project and seeing what features needed to be improved and what features were good to begin with. I think this is a skill that we all learned throughout the project, as it forced us to think from different perspectives and also take them into account while building out the project.

#### **New Questions**

I think the main questions that we had based on this extension is how can we specifically train each user’s extension to have everything accustomed to their workflow. Everyone uses the computer differently, and although the notification system right now is based on prompting in the backend, is there a way to make it so the extension is able to actually learn how the user uses their computer and identify things such as “during lunch time you are more prone to using youtube past the allocated hour time\! ” and phrases like that. Things like that would allow the user to have an entire new realm of knowledge of their usage that would go over their head previously. Additionally, we had some questions about if there are certain visual cues that could be even more helpful than what we currently have. We were able to read some research papers that were able to find the different times it takes to see when someone is being distracted. However, we definitely have more questions about what visual cues are not just engaging, but also help bolster the process when someone is productive. Therefore, we could more readily identify what is seen as irritating and what is seen as helpful.
