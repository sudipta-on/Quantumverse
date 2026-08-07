import { Routes, Route } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";

import Home from "../pages/Home";
import Courses from "../pages/Courses";
import Course from "../pages/Course";
import Playground from "../pages/Playground";
import Tool from "../pages/Tool";
import Composer from "../pages/Composer";
import About from "../pages/About";
import NotFound from "../pages/NotFound";

export default function AppRouter() {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />

                <Route path="/courses" element={<Courses />} />

                <Route path="/courses/:slug" element={<Course />} />

                <Route path="/playground" element={<Playground />} />

                <Route path="/playground/:tool" element={<Tool />} />

                <Route path="/composer" element={<Composer />} />

                <Route path="/about" element={<About />} />
            </Route>

            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}